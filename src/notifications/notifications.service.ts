// src/notifications/notifications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { 
  Notification, 
  NotificationDocument, 
  NotificationType,
  NotificationRefModel
} from './schemas/notification.schema';
import { 
  CreateNotificationDto, 
  NotificationQueryDto 
} from './dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private usersService: UsersService
  ) {}

  /**
   * 创建通知
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationDocument> {
    const {
      userId,
      message,
      title,
      type,
      relatedTo,
      onModel,
      action,
      actionUrl
    } = createNotificationDto;

    // 验证用户ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // 检查用户是否存在
    await this.usersService.findById(userId);

    // 创建通知
    const notification = new this.notificationModel({
      user: userId,
      message,
      title: title || 'Notification',
      type: type || NotificationType.SYSTEM,
      isRead: false,
      relatedTo: relatedTo ? new Types.ObjectId(relatedTo) : undefined,
      onModel,
      action,
      actionUrl
    });

    return notification.save();
  }

  /**
   * 获取用户的通知
   */
  async findAllForUser(
    userId: string,
    queryDto: NotificationQueryDto
  ): Promise<{
    notifications: NotificationDocument[];
    unreadCount: number;
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    // 验证用户ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const { type, isRead, page = 1, limit = 10 } = queryDto;

    // 构建查询
    const query: any = { user: userId };

    if (type !== undefined) {
      query.type = type;
    }

    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 执行查询
    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username email'),
      this.notificationModel.countDocuments(query),
      this.notificationModel.countDocuments({ user: userId, isRead: false })
    ]);

    return {
      notifications,
      unreadCount,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  /**
   * 获取单个通知
   */
  async findOne(id: string, userId: string): Promise<NotificationDocument> {
    // 验证ID
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid notification ID');
    }

    const notification = await this.notificationModel.findOne({
      _id: id,
      user: userId
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found or does not belong to the user`);
    }

    return notification;
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.findOne(id, userId);

    if (notification.isRead) {
      return notification; // 已经是已读状态，不需要更新
    }

    notification.isRead = true;
    return notification.save();
  }

  /**
   * 标记用户的所有通知为已读
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    // 验证用户ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // 更新所有未读通知
    const result = await this.notificationModel.updateMany(
      { user: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return { count: result.modifiedCount };
  }

  /**
   * 删除通知
   */
  async remove(id: string, userId: string): Promise<{ deleted: boolean }> {
    // 验证通知存在且属于该用户
    await this.findOne(id, userId);

    const result = await this.notificationModel.deleteOne({
      _id: id,
      user: userId
    });

    return { deleted: result.deletedCount > 0 };
  }

  /**
   * 获取用户未读通知数量
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    // 验证用户ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const count = await this.notificationModel.countDocuments({
      user: userId,
      isRead: false
    });

    return { count };
  }

  /**
   * 创建预订相关的通知
   */
  async createBookingNotification(
    userId: string,
    bookingId: string,
    message: string,
    title: string = 'Booking Update'
  ): Promise<NotificationDocument> {
    return this.create({
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
   * 创建提醒通知
   */
  async createReminderNotification(
    userId: string,
    bookingId: string,
    message: string,
    title: string = 'Upcoming Session'
  ): Promise<NotificationDocument> {
    return this.create({
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
   * 创建系统通知
   */
  async createSystemNotification(
    userId: string,
    message: string,
    title: string = 'System Notification'
  ): Promise<NotificationDocument> {
    return this.create({
      userId,
      message,
      title,
      type: NotificationType.SYSTEM
    });
  }

  /**
   * 为多个用户创建通知
   */
  async createNotificationForMultipleUsers(
    userIds: string[],
    message: string,
    title: string,
    type: NotificationType = NotificationType.SYSTEM
  ): Promise<NotificationDocument[]> {
    const notificationPromises = userIds.map(userId => {
      return this.create({
        userId,
        message,
        title,
        type
      });
    });

    return Promise.all(notificationPromises);
  }
}