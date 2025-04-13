import { PrismaClient, RefreshToken, PasswordReset } from '@prisma/client';
import prisma from '../../config/prisma';

export class AuthRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async createPasswordReset(
    userId: string,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordReset> {
    return this.prisma.passwordReset.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findPasswordReset(token: string): Promise<PasswordReset | null> {
    return this.prisma.passwordReset.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deletePasswordReset(token: string): Promise<void> {
    await this.prisma.passwordReset.delete({
      where: { token },
    });
  }
}

export const authRepository = new AuthRepository();
