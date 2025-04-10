import type { Response } from 'express';
import { ServiceResponse } from '../model/serviceResponse';

export const handleServiceResponse = <T>(
  serviceResponse: ServiceResponse<T>,
  response: Response,
) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};
