import redis from '../config/redis';
import { env } from '../config/env';
import { authRepository } from '../modules/auth/auth.repository';

const USER_ACTIVITY_PREFIX = 'user_activity:';

export class UserActivityManager {
  static async updateLastActivity(userId: string): Promise<void> {
    const key = `${USER_ACTIVITY_PREFIX}${userId}`;
    await redis.set(key, Date.now().toString(), 'EX', env.USER_IDLE_TIMEOUT / 1000);
  }

  static async checkAndUpdateActivity(userId: string): Promise<boolean> {
    const key = `${USER_ACTIVITY_PREFIX}${userId}`;
    const lastActivity = await redis.get(key);

    if (!lastActivity) {
      // User has been idle for too long
      await authRepository.revokeAllUserTokens(userId);
      return false;
    }

    // Update last activity
    await this.updateLastActivity(userId);
    return true;
  }
}
