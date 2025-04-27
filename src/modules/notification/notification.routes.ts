import express from 'express';
import { notificationController, NotificationController } from './notification.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateMiddleware';
import { updateNotificationSchema } from './notification.schema';

const router = express.Router();

router.get('/', authenticateToken, notificationController.getUserNotifications);

router.patch('/:id/read', authenticateToken, notificationController.markAsRead);

router.patch(
  '/:id',
  authenticateToken,
  validateRequest({
    body: updateNotificationSchema,
  }),
  notificationController.updateNotification,
);

export default router;
