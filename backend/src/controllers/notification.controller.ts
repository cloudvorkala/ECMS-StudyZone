// src/controllers/notification.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import notificationService from '../services/notification.service';
import { errorHandler } from '../utils/errorHandler';

export class NotificationController {
  /**
   * Get user notifications
   * @route GET /api/notifications
   * @access Private
   */
  async getUserNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const { notifications, unreadCount } = await notificationService.getUserNotifications(userId);
      
      res.status(200).json({
        notifications,
        unreadCount
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Mark notification as read
   * @route PUT /api/notifications/:id/read
   * @access Private
   */
  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const notificationId = req.params.id;
      
      const success = await notificationService.markAsRead(notificationId, userId);
      
      if (!success) {
        res.status(404).json({ message: 'Notification not found or does not belong to user' });
        return;
      }
      
      res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Mark all notifications as read
   * @route PUT /api/notifications/read-all
   * @access Private
   */
  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const success = await notificationService.markAllAsRead(userId);
      
      if (!success) {
        res.status(500).json({ message: 'Failed to mark notifications as read' });
        return;
      }
      
      res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
      errorHandler(error, res);
    }
  }
  
  /**
   * Delete notification
   * @route DELETE /api/notifications/:id
   * @access Private
   */
  async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const notificationId = req.params.id;
      
      const success = await notificationService.deleteNotification(notificationId, userId);
      
      if (!success) {
        res.status(404).json({ message: 'Notification not found or does not belong to user' });
        return;
      }
      
      res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
      errorHandler(error, res);
    }
  }
  
  /**
   * Get unread notification count
   * @route GET /api/notifications/unread-count
   * @access Private
   */
  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const count = await notificationService.getUnreadCount(userId);
      
      res.status(200).json({ count });
    } catch (error) {
      errorHandler(error, res);
    }
  }
}

export default new NotificationController();