import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { validateRequest } from '../../middleware/validateMiddleware';
import { notificationController, streamNotifications } from './notification.controller';
import { updateNotificationSchema } from './notification.schema';

const router = express.Router();

// SSE endpoint
router.get('/stream', authenticateToken, streamNotifications);

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
