import { z } from 'zod';
import { loginUserSchema, registerUserSchema } from './auth.schema';

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;

export interface TokenPayload {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenFamily: string;
}
