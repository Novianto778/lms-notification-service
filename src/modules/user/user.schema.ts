import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'instructor', 'student']).default('student'),
});

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const userReturnSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(['admin', 'instructor', 'student']),
  createdAt: z.date(),
});

export const getUserByIdParamsSchema = z.object({
  id: z.string().uuid(),
});
