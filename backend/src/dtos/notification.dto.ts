// src/dtos/notification.dto.ts
import { NotificationType, NotificationRefModel } from '../models/notification.model';

export interface CreateNotificationDto {
  userId: string;
  message: string;
  title?: string;
  type?: NotificationType;
  relatedTo?: string;
  onModel?: NotificationRefModel | null;
  action?: string;
  actionUrl?: string;
}

export interface NotificationResponseDto {
  id: string;
  message: string;
  title: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
  action?: string;
  actionUrl?: string;
  relatedTo?: string;
  onModel?: string;
}