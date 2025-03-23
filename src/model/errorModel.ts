import { StatusCodes } from 'http-status-codes';
import type { ZodError, ZodIssue } from 'zod';

export class AuthenticationError extends Error {
  private statusCodes: StatusCodes;
  constructor(
    message = 'You must be authenticated to do this action',
    statusCodes = StatusCodes.UNAUTHORIZED,
  ) {
    super(message);
    this.statusCodes = statusCodes;
  }

  getErrors() {
    return this.message;
  }

  getStatusCodes() {
    return this.statusCodes;
  }
}

export class ValidationError extends Error {
  private errors: ZodError;
  private statusCodes: StatusCodes;

  constructor(
    errors: ZodError,
    message = 'An validation error occured',
    statusCodes = StatusCodes.BAD_REQUEST,
  ) {
    super(message);
    this.errors = errors;
    this.statusCodes = statusCodes;
  }

  getErrors() {
    return this.errors.issues
      .map((issue: ZodIssue) => {
        return `${issue.path.join('.')}: ${issue.message}`;
      })
      .join(', ');
  }

  getStatusCodes() {
    return this.statusCodes;
  }
}

export class AppError extends Error {
  private statusCodes: StatusCodes;
  constructor(message = 'An error occured', statusCodes = StatusCodes.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCodes = statusCodes;
  }

  getErrors() {
    return this.message;
  }

  getStatusCodes() {
    return this.statusCodes;
  }
}
