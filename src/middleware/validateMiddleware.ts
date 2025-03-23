import { NextFunction, Request, Response } from 'express';
import { ZodSchema, z } from 'zod';
import { parseQueryOrParams } from '../utils/queryParams';

type ValidationSchema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validateRequest =
  (schemas: ValidationSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const query = parseQueryOrParams(req.query);
    const params = parseQueryOrParams(req.params);

    const validationSchema = z.object({
      body: schemas.body || z.any(),
      query: schemas.query || z.any(),
      params: schemas.params || z.any(),
    });

    const result = validationSchema.parse({ body: req.body, query, params });

    req.body = result.body;
    req.query = result.query;
    req.params = result.params;

    next();
  };
