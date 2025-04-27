import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { env } from './config/env';
import { kafkaProducer } from './config/kafka';
import logger from './config/logger';
import { initializeWebSocket } from './config/websocket';
import { securityConfig } from './config/security';
import errorMiddleware from './middleware/errorMiddleware';
import routes from './modules';

const app = express();

async function initializeApp() {
  try {
    // Connect to Kafka
    await kafkaProducer.connect();

    // Middleware
    app.use(
      cors({
        origin: env.CORS_ORIGIN,
        // Enable SSE support
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      }),
    );

    // Apply security configuration
    app.use(helmet(securityConfig));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Health check endpoint
    app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });

    // Routes
    app.use('/', routes);

    // Error handling
    app.use(errorMiddleware());

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket
    initializeWebSocket(server);

    return server;
  } catch (error) {
    logger.error('Failed to initialize app:', error);
    throw error;
  }
}

export default initializeApp;
