import { StatusCodes } from 'http-status-codes';
import type { ZodError, ZodIssue } from 'zod';
import { Prisma } from '@prisma/client';

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

export class PrismaError extends Error {
  private statusCodes: StatusCodes;
  private code: string;

  constructor(error: Prisma.PrismaClientKnownRequestError) {
    const message = PrismaError.getMessageFromCode(error);
    super(message);
    this.code = error.code;
    this.statusCodes = PrismaError.getStatusCodeFromError(error);
  }

  private static getMessageFromCode(error: Prisma.PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2002': {
        const field = (error.meta?.target as string[])?.join(', ');
        return `A user with this ${field} already exists`;
      }
      case 'P2014':
        return 'Invalid ID provided';
      case 'P2003':
        return 'Foreign key constraint failed';
      case 'P2025':
        return 'Record not found';
      case 'P2021':
        return 'Table does not exist';
      case 'P2022':
        return 'Column does not exist';
      default:
        return 'Database error occurred';
    }
  }

  private static getStatusCodeFromError(error: Prisma.PrismaClientKnownRequestError): StatusCodes {
    switch (error.code) {
      case 'P2002':
        return StatusCodes.CONFLICT;
      case 'P2025':
        return StatusCodes.NOT_FOUND;
      case 'P2014':
      case 'P2003':
        return StatusCodes.BAD_REQUEST;
      default:
        return StatusCodes.INTERNAL_SERVER_ERROR;
    }
  }

  getErrors() {
    return this.message;
  }

  getStatusCodes() {
    return this.statusCodes;
  }

  getCode() {
    return this.code;
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
