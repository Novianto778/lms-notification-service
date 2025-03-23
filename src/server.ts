import app from './app';
import logger from './config/logger';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing server.');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});
