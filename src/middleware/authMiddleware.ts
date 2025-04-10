import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { AuthenticationError } from '../model/errorModel';
import { JWTPayload } from '../types/express';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export const authenticateToken = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('No token provided', StatusCodes.UNAUTHORIZED);
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    throw new AuthenticationError('Invalid token', StatusCodes.UNAUTHORIZED);
  }
};

export const authorizeRoles = (...roles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AuthenticationError('Unauthorized access', StatusCodes.FORBIDDEN);
    }
    next();
  };
};
