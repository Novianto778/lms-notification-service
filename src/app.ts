import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import errorMiddleware from './middleware/errorMiddleware';
import { env } from './config/env';
import dotenv from 'dotenv';
import { kafkaProducer } from './config/kafka';
import routes from './modules';

dotenv.config(); // Load environment variables from .env file

const app = express();

// Connect to Kafka
kafkaProducer.connect().catch((error) => {
  console.error('Failed to connect to Kafka:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received.');
  await kafkaProducer.disconnect();
  process.exit(0);
});

// Middleware
app.use(
  cors({
    origin: env.CORS_ORIGIN,
  }),
);
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(express.json());

// Routes
app.get('/', (_req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use('/', routes);

// Error Handler
app.use(errorMiddleware());

export default app;
