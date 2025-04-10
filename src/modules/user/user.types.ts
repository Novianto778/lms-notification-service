import { z } from 'zod';
import { registerUserSchema, userReturnSchema, loginUserSchema } from './user.schema';

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type UserReturn = z.infer<typeof userReturnSchema>;
