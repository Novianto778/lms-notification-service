import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  price: z.number().positive(),
  published: z.boolean().optional().default(false),
});

export const courseIdParamSchema = z.object({
  id: z.string().uuid(),
});
