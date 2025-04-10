import { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { AppError, AuthenticationError, ValidationError, PrismaError } from '../model/errorModel';
import { ServiceResponse } from '../model/serviceResponse';
import { handleServiceResponse } from '../utils/httpHandlers';
import { zodErrorMessage } from '../utils/zodError';
import logger from '../config/logger';
import { Prisma } from '@prisma/client';

const unexpectedRequest: RequestHandler = (_req, res) => {
  res.sendStatus(StatusCodes.NOT_FOUND);
};

const addErrorToRequestLog: ErrorRequestHandler = (err, _req, res, next) => {
  res.locals.err = err;
  next(err);
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error(err);

  if (err instanceof ZodError) {
    const errorMsg = zodErrorMessage(err);
    const errorRes = ServiceResponse.failure(errorMsg, null, StatusCodes.BAD_REQUEST);
    handleServiceResponse(errorRes, res);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = new PrismaError(err);
    const errorRes = ServiceResponse.failure(
      prismaError.getErrors(),
      null,
      prismaError.getStatusCodes(),
    );
    handleServiceResponse(errorRes, res);
    return;
  }

  if (err instanceof ValidationError) {
    const errorRes = ServiceResponse.failure(
      err.getErrors(),
      null,
      err.getStatusCodes() || StatusCodes.BAD_REQUEST,
    );
    handleServiceResponse(errorRes, res);
    return;
  } else if (err instanceof AuthenticationError) {
    const errorRes = ServiceResponse.failure(
      err.getErrors(),
      null,
      err.getStatusCodes() || StatusCodes.UNAUTHORIZED,
    );
    handleServiceResponse(errorRes, res);
    return;
  } else if (err instanceof AppError) {
    const errorRes = ServiceResponse.failure(
      err.message,
      null,
      err.getStatusCodes() || StatusCodes.INTERNAL_SERVER_ERROR,
    );
    handleServiceResponse(errorRes, res);
    return;
  } else {
    const errorRes = ServiceResponse.failure(
      'An error occurred',
      null,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
    handleServiceResponse(errorRes, res);
    return;
  }
};

const errorMiddleware = () => [addErrorToRequestLog, globalErrorHandler, unexpectedRequest];

export default errorMiddleware;
