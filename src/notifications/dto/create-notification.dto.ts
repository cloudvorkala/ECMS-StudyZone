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





