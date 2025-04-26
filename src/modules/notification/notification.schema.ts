import { z } from 'zod';
import { NotificationStatus, NotificationType } from './notification.types';

export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1).max(255),
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export const updateNotificationSchema = z.object({
  status: z.nativeEnum(NotificationStatus).optional(),
});

export const notificationIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const notificationFiltersSchema = z
  .object({
    status: z.nativeEnum(NotificationStatus).optional(),
    type: z.nativeEnum(NotificationType).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.startDate <= data.endDate;
      }
      return true;
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['startDate'],
    },
  );

export const markAsReadParamSchema = z.object({
  id: z.string().uuid(),
});

// Response schemas for swagger/openapi documentation
export const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  status: z.nativeEnum(NotificationStatus),
  metadata: z.record(z.any()).nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const notificationListResponseSchema = z.array(notificationResponseSchema);

export type CreateNotificationSchemaType = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationSchemaType = z.infer<typeof updateNotificationSchema>;
export type NotificationFiltersSchemaType = z.infer<typeof notificationFiltersSchema>;
export type NotificationResponseSchemaType = z.infer<typeof notificationResponseSchema>;
