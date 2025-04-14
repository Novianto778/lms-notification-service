import axios from 'axios';
import { env } from './env';
import { AppError } from '../model/errorModel';
import { StatusCodes } from 'http-status-codes';

export const userServiceClient = axios.create({
  baseURL: env.USER_SERVICE_URL,
  timeout: 5000,
});

// Add response interceptor for error handling
userServiceClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new AppError(
        error.response.data.message || 'User service error',
        error.response.status,
      );
    }
    throw new AppError('User service is unavailable', StatusCodes.SERVICE_UNAVAILABLE);
  },
);
