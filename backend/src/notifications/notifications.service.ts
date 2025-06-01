import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
  ) {}

  async create(adminId: string, createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      createdBy: adminId,
    });
    return notification.save();
  }

  async findAll(): Promise<Notification[]> {
    return this.notificationModel
      .find({ isActive: true })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findActive(): Promise<Notification[]> {
    const now = new Date();
    return this.notificationModel
      .find({
        isActive: true,
        startDate: { $lte: now },
        $or: [
          { endDate: { $exists: false } },
          { endDate: { $gt: now } }
        ]
      })
      .populate('createdBy', 'fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Notification> {
    const notification = await this.notificationModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (!notification.readBy.includes(userId as any)) {
      notification.readBy.push(userId as any);
      await notification.save();
    }

    return notification;
  }

  async deactivate(id: string, adminId: string): Promise<Notification> {
    console.log('Attempting to deactivate notification:', { id, adminId });

    const notification = await this.notificationModel.findById(id);
    if (!notification) {
      console.log('Notification not found:', id);
      throw new NotFoundException('Notification not found');
    }

    console.log('Found notification:', {
      id: notification._id,
      createdBy: notification.createdBy,
      adminId: adminId
    });

    // Convert both to strings for comparison
    const notificationCreatorId = notification.createdBy.toString();
    const requestingAdminId = adminId.toString();

    if (notificationCreatorId !== requestingAdminId) {
      console.log('Permission denied:', {
        notificationCreator: notificationCreatorId,
        requestingAdmin: requestingAdminId
      });
      throw new BadRequestException('Only the creator can deactivate this notification');
    }

    notification.isActive = false;
    const savedNotification = await notification.save();
    console.log('Notification deactivated successfully:', savedNotification._id);
    return savedNotification;
  }
}