import { z } from 'zod';

export const exampleSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

export const exampleReturnSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const getAllExamplesQuerySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
});

export const getExampleByIdQuerySchema = z.object({
  id: z.number(),
});
