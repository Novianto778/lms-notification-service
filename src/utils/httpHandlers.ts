import type { Response } from 'express';
import { ServiceResponse } from '../model/serviceResponse';

export const handleServiceResponse = (
  serviceResponse: ServiceResponse<any>,
  response: Response,
) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};
