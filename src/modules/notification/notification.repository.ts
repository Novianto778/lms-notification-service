import { PrismaClient, Notification } from '@prisma/client';
import {
  CreateNotificationDto,
  NotificationFilters,
  UpdateNotificationDto,
} from './notification.types';

export class NotificationRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  async create(data: CreateNotificationDto): Promise<Notification> {
    return this.prisma.notification.create({ data });
  }

  async findById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async findByUserId(userId: string, filters: NotificationFilters) {
    const where: any = { userId };

    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.startDate) where.createdAt = { gte: filters.startDate };
    if (filters.endDate) where.createdAt = { ...where.createdAt, lte: filters.endDate };

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateNotificationDto): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === 'READ' && { readAt: new Date() }),
      },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { status: 'READ', readAt: new Date() },
    });
  }

  async deleteById(id: string): Promise<void> {
    await this.prisma.notification.delete({ where: { id } });
  }
}
