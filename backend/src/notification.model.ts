// src/models/notification.model.ts
import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { IUserDocument } from './user.model';

export enum NotificationType {
  SYSTEM = 'system',
  BOOKING = 'booking',
  REMINDER = 'reminder',
  MESSAGE = 'message'
}

export enum NotificationRefModel {
  BOOKING = 'Booking',
  USER = 'User',
  HELP_REQUEST = 'HelpRequest'
}

export interface INotification {
  user: Types.ObjectId | IUserDocument;
  message: string;
  title: string;
  type: NotificationType;
  isRead: boolean;
  relatedTo?: Types.ObjectId;
  onModel?: NotificationRefModel | null;
  action?: string;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationDocument extends INotification, Document {
  // Add any instance methods here
}

export interface INotificationModel extends Model<INotificationDocument> {
  // Add any static methods here
}

const notificationSchema = new Schema<INotificationDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    title: {
      type: String,
      default: 'Notification'
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      default: NotificationType.SYSTEM
    },
    isRead: {
      type: Boolean,
      default: false
    },
    relatedTo: {
      type: Schema.Types.ObjectId,
      refPath: 'onModel',
      default: null
    },
    onModel: {
      type: String,
      enum: [...Object.values(NotificationRefModel), null],
      default: null
    },
    action: {
      type: String,
      default: null
    },
    actionUrl: {
      type: String,
      default: null
    }
  }, 
  { timestamps: true }
);

// Index for faster retrieval of user notifications
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

const Notification = mongoose.model<INotificationDocument, INotificationModel>('Notification', notificationSchema);

export default Notification;