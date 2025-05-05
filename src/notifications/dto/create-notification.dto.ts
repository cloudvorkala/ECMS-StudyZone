// src/notifications/dto/create-notification.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsUrl, 
  IsMongoId 
} from 'class-validator';
import { 
  NotificationType, 
  NotificationRefModel 
} from '../schemas/notification.schema';

export class CreateNotificationDto {
  @ApiProperty({ 
    description: 'User ID to send notification to',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'You have a new booking request'
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Booking',
    required: false
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
    required: false
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({
    description: 'Related entity ID',
    example: '60d21b4667d0d8992e610c86',
    required: false
  })
  @IsOptional()
  @IsMongoId()
  relatedTo?: string;

  @ApiProperty({
    description: 'Model type of related entity',
    enum: NotificationRefModel,
    required: false
  })
  @IsOptional()
  @IsEnum(NotificationRefModel)
  onModel?: NotificationRefModel;

  @ApiProperty({
    description: 'Action text',
    example: 'View Booking',
    required: false
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'Action URL',
    example: '/bookings/60d21b4667d0d8992e610c86',
    required: false
  })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}

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

// src/notifications/dto/notification-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '../schemas/notification.schema';

export class NotificationQueryDto {
  @ApiProperty({ 
    description: 'Filter by notification type',
    enum: NotificationType,
    required: false
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiProperty({ 
    description: 'Filter by read status',
    required: false,
    type: Boolean
  })
  @IsOptional()
  isRead?: boolean;

  @ApiProperty({ 
    description: 'Page number',
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Items per page',
    minimum: 1,
    maximum: 50,
    default: 10,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}

// Export all DTOs from index file
// src/notifications/dto/index.ts
export * from './create-notification.dto';
export * from './notification-response.dto';
export * from './notification-query.dto';