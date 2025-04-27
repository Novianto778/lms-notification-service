import logger from './config/logger';
import initializeApp from './app';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const server = await initializeApp();
    server.listen(PORT, () => {
      logger.info(`Notification service running on port ${PORT}`);
    });

    // Graceful Shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received. Closing server.');
      server.close(() => {
        logger.info('Server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
