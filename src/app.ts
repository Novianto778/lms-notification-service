import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { env } from './config/env';
import { kafkaProducer } from './config/kafka';
import logger from './config/logger';
import { initializeWebSocket } from './config/websocket';
import errorMiddleware from './middleware/errorMiddleware';
import routes from './modules';

const app = express();

async function initializeApp() {
  try {
    // Connect to Kafka
    await kafkaProducer.connect();

    // Middleware
    app.use(cors({ origin: env.CORS_ORIGIN }));
    app.use(helmet());
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

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM signal received.');
      await kafkaProducer.disconnect();
      process.exit(0);
    });

    const server = http.createServer(app);
    initializeWebSocket(server);

    return server; // Return the HTTP server instead of the Express app
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

export default initializeApp;
