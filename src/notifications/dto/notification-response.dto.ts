// src/notifications/dto/notification-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../schemas/notification.schema';

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '60d21b4667d0d8992e610c87'
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '60d21b4667d0d8992e610c85'
  })
  user: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You have a new booking request'
  })
  message: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Booking'
  })
  title: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.BOOKING
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Read status',
    example: false
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Related entity ID',
    example: '60d21b4667d0d8992e610c86',
    required: false
  })
  relatedTo?: string;

  @ApiProperty({
    description: 'Action text',
    example: 'View Booking',
    required: false
  })
  action?: string;

  @ApiProperty({
    description: 'Action URL',
    example: '/bookings/60d21b4667d0d8992e610c86',
    required: false
  })
  actionUrl?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T12:00:00.000Z'
  })
  createdAt: Date;
}