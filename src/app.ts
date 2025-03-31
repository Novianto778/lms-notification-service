import express from 'express';
import 'express-async-error';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import routes from './modules';
import errorMiddleware from './middleware/errorMiddleware';
import { env } from './config/env';

dotenv.config();

const app = express();

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

app.use('/api', routes);

// Error Handler
app.use(errorMiddleware());

export default app;
