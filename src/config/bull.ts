import { Queue, Worker } from 'bullmq';
import { env } from './env';
import logger from './logger';
import { sendResetPasswordEmail } from '../utils/emailService';

const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
};

// Email Queue
export const emailQueue = new Queue('email', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// Email Worker
const emailWorker = new Worker(
  'email',
  async (job) => {
    try {
      logger.info(`Processing email job ${job.id} of type ${job.name}`);

      switch (job.name) {
        case 'sendResetPasswordEmail':
          await sendResetPasswordEmail(job.data.email, job.data.resetToken);
          break;
        default:
          throw new Error(`Unknown job type: ${job.name}`);
      }
    } catch (error) {
      logger.error(`Error processing email job ${job.id}:`, error);
      throw error;
    }
  },
  { connection },
);

emailWorker.on('completed', (job) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, error) => {
  logger.error(`Email job ${job?.id} failed:`, error);
});
