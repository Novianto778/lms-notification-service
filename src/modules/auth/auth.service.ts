import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../model/errorModel';
import { ServiceResponse } from '../../model/serviceResponse';
import { emailQueue } from '../../config/bull';
import { env } from '../../config/env';
import { userRepository } from '../user/user.repository';
import { authRepository } from './auth.repository';
import { LoginUserDto, RegisterUserDto, TokenPayload } from './auth.types';
import { User } from '@prisma/client';
import { UserActivityManager } from '../../utils/userActivity';
import ms, { StringValue } from 'ms';

export class AuthService {
  private readonly ACCESS_TOKEN_EXPIRES_IN = '15m';
  private readonly REFRESH_TOKEN_EXPIRES_IN = '7d';

  constructor(
    private readonly userRepo = userRepository,
    private readonly authRepo = authRepository,
  ) {}

  private generateTokens(user: User): TokenPayload {
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        tokenFamily: crypto.randomUUID(),
      },
      env.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN },
    );

    return { accessToken, refreshToken };
  }

  async register(userData: RegisterUserDto): Promise<ServiceResponse<{ userId: string }>> {
    const existingUser = await this.userRepo.findByEmailAsync(userData.email);
    if (existingUser) {
      throw new AppError('Email already registered', StatusCodes.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.userRepo.createAsync({
      ...userData,
      password: hashedPassword,
    });

    return ServiceResponse.success(
      'User registered successfully',
      { userId: user.id },
      StatusCodes.CREATED,
    );
  }

  async login(credentials: LoginUserDto): Promise<ServiceResponse<TokenPayload>> {
    const user = await this.userRepo.findByEmailAsync(credentials.email);
    if (!user) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', StatusCodes.UNAUTHORIZED);
    }

    const tokens = this.generateTokens(user);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.authRepo.createRefreshToken(user.id, tokens.refreshToken, expiresAt);

    // Initialize user activity
    await UserActivityManager.updateLastActivity(user.id);

    return ServiceResponse.success('Login successful', tokens);
  }

  async refreshToken(token: string): Promise<ServiceResponse<TokenPayload>> {
    const refreshTokenDoc = await this.authRepo.findRefreshToken(token);
    if (!refreshTokenDoc || refreshTokenDoc.revokedAt) {
      throw new AppError('Invalid refresh token', StatusCodes.UNAUTHORIZED);
    }

    if (refreshTokenDoc.expiresAt < new Date()) {
      throw new AppError('Refresh token expired', StatusCodes.UNAUTHORIZED);
    }

    // Revoke the used refresh token
    await this.authRepo.revokeRefreshToken(token);

    const user = await this.userRepo.findByIdAsync(refreshTokenDoc.userId);

    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND);
    }

    // Generate new tokens
    const tokens = this.generateTokens(user);

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.authRepo.createRefreshToken(user.id, tokens.refreshToken, expiresAt);

    return ServiceResponse.success('Token refreshed successfully', tokens);
  }

  async logout(token: string): Promise<ServiceResponse<null>> {
    await this.authRepo.revokeRefreshToken(token);
    return ServiceResponse.success('Logged out successfully', null);
  }

  async forgotPassword(email: string): Promise<ServiceResponse<null>> {
    const user = await this.userRepo.findByEmailAsync(email);
    console.log(user);

    if (!user) {
      // Return success even if user not found for security
      return ServiceResponse.success('Email not found');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + ms(env.PASSWORD_RESET_TOKEN_EXPIRES_IN as StringValue));

    // Save reset token
    await this.authRepo.createPasswordReset(user.id, resetToken, expiresAt);

    // Queue reset email
    await emailQueue.add('sendResetPasswordEmail', {
      email: user.email,
      resetToken,
    });

    return ServiceResponse.success('Reset email sent');
  }

  async resetPassword(token: string, newPassword: string): Promise<ServiceResponse<null>> {
    const passwordReset = await this.authRepo.findPasswordReset(token);

    if (!passwordReset || passwordReset.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', StatusCodes.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepo.updatePassword({
      where: { id: passwordReset.userId },
      data: { password: hashedPassword },
    });
    await this.authRepo.deletePasswordReset(token);

    return ServiceResponse.success('Password reset successful');
  }
}

export const authService = new AuthService();
