import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Define log directory
const logDir = path.join(__dirname, '../../logs');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

// Create logger
const logger = winston.createLogger({
  level: 'info', // Default log level
  format: logFormat,
  transports: [
    // Console logging (only in development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Colorized output
        winston.format.simple(), // Simpler format for console
      ),
      level: process.env.NODE_ENV === 'production' ? 'error' : 'debug', // Log less in production
    }),

    // Daily rotated log files
    new DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),

    // Separate error log file
    new DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
  ],
});

// If not in production, log to console with human-readable format
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  );
}

export default logger;
