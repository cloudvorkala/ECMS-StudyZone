// src/routes/notification.routes.ts
import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

// Get all notifications for current user
router.get(
  '/',
  notificationController.getUserNotifications.bind(notificationController)
);

// Get unread notification count
router.get(
  '/unread-count',
  notificationController.getUnreadCount.bind(notificationController)
);

// Mark all notifications as read
router.put(
  '/read-all',
  notificationController.markAllAsRead.bind(notificationController)
);

// Mark a specific notification as read
router.put(
  '/:id/read',
  notificationController.markAsRead.bind(notificationController)
);

// Delete a notification
router.delete(
  '/:id',
  notificationController.deleteNotification.bind(notificationController)
);

export default router;