// src/services/notification.service.ts
import Notification, { 
    INotificationDocument, 
    NotificationType,
    NotificationRefModel 
  } from '../models/notification.model';
  import { CreateNotificationDto } from '../dtos/notification.dto';
  
  export class NotificationService {
    /**
     * Create a new notification
     */
    async createNotification(notificationData: CreateNotificationDto): Promise<INotificationDocument> {
      const notification = new Notification({
        user: notificationData.userId,
        message: notificationData.message,
        title: notificationData.title || 'Notification',
        type: notificationData.type || NotificationType.SYSTEM,
        relatedTo: notificationData.relatedTo || null,
        onModel: notificationData.onModel || null,
        action: notificationData.action || null,
        actionUrl: notificationData.actionUrl || null
      });
      
      await notification.save();
      
      return notification;
    }
    
    /**
     * Get all notifications for a user
     */
    async getUserNotifications(userId: string): Promise<{
      notifications: INotificationDocument[];
      unreadCount: number;
    }> {
      const notifications = await Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50); // Limit to prevent performance issues
        
      const unreadCount = await Notification.countDocuments({ 
        user: userId,
        isRead: false
      });
      
      return {
        notifications,
        unreadCount
      };
    }
    
    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
      const result = await Notification.updateOne(
        { _id: notificationId, user: userId },
        { $set: { isRead: true } }
      );
      
      return result.modifiedCount > 0;
    }
    
    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<boolean> {
      const result = await Notification.updateMany(
        { user: userId, isRead: false },
        { $set: { isRead: true } }
      );
      
      return result.modifiedCount > 0;
    }
    
    /**
     * Delete a notification
     */
    async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
      const result = await Notification.deleteOne({
        _id: notificationId,
        user: userId
      });
      
      return result.deletedCount > 0;
    }
    
    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: string): Promise<number> {
      return Notification.countDocuments({
        user: userId,
        isRead: false
      });
    }
    
    /**
     * Create a booking notification
     */
    async createBookingNotification(
      userId: string, 
      bookingId: string, 
      message: string,
      title: string = 'Booking Update'
    ): Promise<INotificationDocument> {
      return this.createNotification({
        userId,
        message,
        title,
        type: NotificationType.BOOKING,
        relatedTo: bookingId,
        onModel: NotificationRefModel.BOOKING,
        action: 'View Booking',
        actionUrl: `/bookings/${bookingId}`
      });
    }
    
    /**
     * Create a reminder notification
     */
    async createReminderNotification(
      userId: string,
      bookingId: string,
      message: string,
      title: string = 'Upcoming Session'
    ): Promise<INotificationDocument> {
      return this.createNotification({
        userId,
        message,
        title,
        type: NotificationType.REMINDER,
        relatedTo: bookingId,
        onModel: NotificationRefModel.BOOKING,
        action: 'View Session',
        actionUrl: `/bookings/${bookingId}`
      });
    }
    
    /**
     * Create a system notification
     */
    async createSystemNotification(
      userId: string,
      message: string,
      title: string = 'System Notification'
    ): Promise<INotificationDocument> {
      return this.createNotification({
        userId,
        message,
        title,
        type: NotificationType.SYSTEM
      });
    }
    
    /**
     * Create notifications for multiple users
     */
    async createNotificationForMultipleUsers(
      userIds: string[],
      message: string,
      title: string,
      type: NotificationType = NotificationType.SYSTEM
    ): Promise<INotificationDocument[]> {
      const notificationPromises = userIds.map(userId => {
        return this.createNotification({
          userId,
          message,
          title,
          type
        });
      });
      
      return Promise.all(notificationPromises);
    }
  }
  
  export default new NotificationService();