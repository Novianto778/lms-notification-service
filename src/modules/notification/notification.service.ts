import { StatusCodes } from 'http-status-codes';
import { AppError } from '../../model/errorModel';
import { ServiceResponse } from '../../model/serviceResponse';
import { NotificationRepository } from './notification.repository';
import {
  CreateNotificationDto,
  NotificationFilters,
  UpdateNotificationDto,
} from './notification.types';
import { kafkaProducer } from '../../config/kafka';
import { KAFKA_TOPICS } from '../../constants/kafka';
import redis from '../../config/redis';
import { Notification } from '@prisma/client';

export class NotificationService {
  private notificationRepository: NotificationRepository;
  private readonly CACHE_TTL = 3600; // 1 hour
  private readonly CACHE_KEY_PREFIX = 'notification:';
  private readonly USER_NOTIFICATIONS_PREFIX = 'user-notifications:';

  constructor(notificationRepository: NotificationRepository = new NotificationRepository()) {
    this.notificationRepository = notificationRepository;
  }

  private getCacheKey(id: string): string {
    return `${this.CACHE_KEY_PREFIX}${id}`;
  }

  private getUserNotificationsCacheKey(userId: string): string {
    return `${this.USER_NOTIFICATIONS_PREFIX}${userId}`;
  }

  async createNotification(data: CreateNotificationDto): Promise<ServiceResponse<Notification>> {
    const notification = await this.notificationRepository.create(data);

    // Cache the new notification
    const cacheKey = this.getCacheKey(notification.id);
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(notification));

    // Invalidate user notifications cache
    const userCacheKey = this.getUserNotificationsCacheKey(data.userId);
    await redis.del(userCacheKey);

    // Emit event for real-time notifications
    await kafkaProducer.produce(KAFKA_TOPICS.NOTIFICATION_CREATED, {
      notification,
      userId: data.userId,
    });

    return ServiceResponse.success(
      'Notification created successfully',
      notification,
      StatusCodes.CREATED,
    );
  }

  async getUserNotifications(
    userId: string,
    filters: NotificationFilters,
  ): Promise<ServiceResponse<Notification[]>> {
    const cacheKey = this.getUserNotificationsCacheKey(userId);

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      const notifications = JSON.parse(cached);
      // Apply filters on cached data
      const filteredNotifications = this.applyFilters(notifications, filters);
      return ServiceResponse.success('Notifications retrieved from cache', filteredNotifications);
    }

    // Get from database
    const notifications = await this.notificationRepository.findByUserId(userId, filters);

    // Cache the full list (without filters)
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(notifications));

    return ServiceResponse.success('Notifications retrieved successfully', notifications);
  }

  async markAsRead(userId: string, notificationId: string): Promise<ServiceResponse<Notification>> {
    const notification = await this.getNotificationFromCacheOrDb(notificationId);

    if (!notification) {
      throw new AppError('Notification not found', StatusCodes.NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new AppError('Unauthorized access', StatusCodes.FORBIDDEN);
    }

    const updatedNotification = await this.notificationRepository.markAsRead(notificationId);

    // Update cache
    await this.updateNotificationCache(updatedNotification);

    // Invalidate user notifications cache
    const userCacheKey = this.getUserNotificationsCacheKey(userId);
    await redis.del(userCacheKey);

    // Emit event
    await kafkaProducer.produce(KAFKA_TOPICS.NOTIFICATION_READ, {
      notificationId,
      userId,
    });

    return ServiceResponse.success('Notification marked as read', updatedNotification);
  }

  async updateNotification(
    userId: string,
    notificationId: string,
    data: UpdateNotificationDto,
  ): Promise<ServiceResponse<Notification>> {
    const notification = await this.getNotificationFromCacheOrDb(notificationId);

    if (!notification) {
      throw new AppError('Notification not found', StatusCodes.NOT_FOUND);
    }

    if (notification.userId !== userId) {
      throw new AppError('Unauthorized access', StatusCodes.FORBIDDEN);
    }

    const updatedNotification = await this.notificationRepository.update(notificationId, data);

    // Update cache
    await this.updateNotificationCache(updatedNotification);

    // Invalidate user notifications cache
    const userCacheKey = this.getUserNotificationsCacheKey(userId);
    await redis.del(userCacheKey);

    // Emit event
    await kafkaProducer.produce(KAFKA_TOPICS.NOTIFICATION_UPDATED, {
      notification: updatedNotification,
      userId,
    });

    return ServiceResponse.success('Notification updated successfully', updatedNotification);
  }

  private async getNotificationFromCacheOrDb(id: string): Promise<Notification | null> {
    const cacheKey = this.getCacheKey(id);

    // Try to get from cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const notification = await this.notificationRepository.findById(id);
    if (notification) {
      // Cache the result
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(notification));
    }

    return notification;
  }

  private async updateNotificationCache(notification: Notification): Promise<void> {
    const cacheKey = this.getCacheKey(notification.id);
    await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(notification));
  }

  private applyFilters(
    notifications: Notification[],
    filters: NotificationFilters,
  ): Notification[] {
    return notifications.filter((notification) => {
      if (filters.status && notification.status !== filters.status) {
        return false;
      }
      if (filters.type && notification.type !== filters.type) {
        return false;
      }
      if (filters.startDate && new Date(notification.createdAt) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(notification.createdAt) > new Date(filters.endDate)) {
        return false;
      }
      return true;
    });
  }
}

export const notificationService = new NotificationService();
