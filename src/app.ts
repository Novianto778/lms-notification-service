import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorMiddleware from './middleware/errorMiddleware';
import { env } from './config/env';
import { kafkaProducer } from './config/kafka';
import routes from './modules';
import logger from './config/logger';
import { ServiceHealthChecker } from './utils/serviceHealthChecker';
import { serviceDependencies } from './config/services';

const app = express();

async function initializeApp() {
  try {
    // Initialize service health checker
    const healthChecker = new ServiceHealthChecker(
      env.SERVICE_RETRY_ATTEMPTS,
      env.SERVICE_RETRY_INTERVAL,
    );

    // Wait for all required services
    const servicesAvailable = await healthChecker.checkAllServices(serviceDependencies);
    if (!servicesAvailable) {
      throw new Error('Failed to connect to required services');
    }

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

    return app;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

export default initializeApp;
