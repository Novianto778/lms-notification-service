import logger from './config/logger';
import initializeApp from './app';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const app = await initializeApp();
    const server = app.listen(PORT, () => {
      logger.info(`Course service running on port ${PORT}`);
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
