import type { Response } from 'express';
import { ServiceResponse } from '../model/serviceResponse';

export const handleServiceResponse = <T>(
  serviceResponse: ServiceResponse<T>,
  response: Response,
): Response<ServiceResponse<T>> => {
  return response.status(serviceResponse.statusCode).json(serviceResponse);
};
