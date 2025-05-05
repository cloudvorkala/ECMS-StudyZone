// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type NotificationDocument = Notification & Document;

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

@Schema({ timestamps: true })
export class Notification {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  })
  user: User;

  @Prop({ required: true })
  message: string;

  @Prop({ default: 'Notification' })
  title: string;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationType), 
    default: NotificationType.SYSTEM 
  })
  type: NotificationType;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, refPath: 'onModel' })
  relatedTo?: MongooseSchema.Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: Object.values(NotificationRefModel),
    default: null
  })
  onModel?: NotificationRefModel;

  @Prop()
  action?: string;

  @Prop()
  actionUrl?: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// 配置模式选项
NotificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// 创建索引以提高查询性能
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });