// src/help-requests/help-requests.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  HelpRequest,
  HelpRequestDocument,
  HelpRequestStatus,
  HelpResponse,
} from './schemas/help-request.schema';
import {
  CreateHelpRequestDto,
  UpdateHelpRequestDto,
  CreateHelpResponseDto,
  HelpRequestQueryDto,
} from './dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class HelpRequestsService {
  constructor(
    @InjectModel(HelpRequest.name)
    private helpRequestModel: Model<HelpRequestDocument>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * 创建新的帮助请求
   */
  async create(
    userId: string,
    createHelpRequestDto: CreateHelpRequestDto,
  ): Promise<HelpRequestDocument> {
    // 验证用户ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    // 检查用户是否存在
    const user = await this.usersService.findById(userId);

    // 创建帮助请求
    const helpRequest = new this.helpRequestModel({
      user: userId,
      ...createHelpRequestDto,
      status: HelpRequestStatus.OPEN,
      responses: [],
    });

    const savedRequest = await helpRequest.save();

    // 查找支持人员并发送通知
    const supportStaff = await this.usersService.findAll(1, 1, [
      UserRole.SUPPORT,
    ]);

    if (supportStaff.users.length > 0) {
      // 向支持人员发送通知
      await this.notificationsService.create({
        userId: supportStaff.users[0]._id.toString(),
        message: `New help request: ${createHelpRequestDto.title}`,
        title: 'New Support Request',
        action: 'View Request',
        actionUrl: `/admin/help/${savedRequest._id}`,
      });
    }

    return savedRequest;
  }

  /**
   * 根据ID查找帮助请求
   */
  async findById(id: string): Promise<HelpRequestDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid help request ID');
    }

    const helpRequest = await this.helpRequestModel
      .findById(id)
      .populate('user', 'username email')
      .populate('assignedTo', 'username email')
      .populate('responses.responder', 'username email');

    if (!helpRequest) {
      throw new NotFoundException(`Help request with ID ${id} not found`);
    }

    return helpRequest;
  }

  /**
   * 获取用户的所有帮助请求
   */
  async findAllForUser(
    userId: string,
    queryDto: HelpRequestQueryDto,
  ): Promise<{
    requests: HelpRequestDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    // 验证用户ID
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const { status, priority, category, page = 1, limit = 10 } = queryDto;

    // 构建查询
    const query: any = { user: userId };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 执行查询
    const [requests, total] = await Promise.all([
      this.helpRequestModel
        .find(query)
        .populate('assignedTo', 'username email')
        .sort({ updatedAt: -1, priority: -1 })
        .skip(skip)
        .limit(limit),
      this.helpRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * 获取所有帮助请求（管理员/支持人员）
   */
  async findAll(queryDto: HelpRequestQueryDto): Promise<{
    requests: HelpRequestDocument[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const {
      status,
      priority,
      category,
      assignedTo,
      page = 1,
      limit = 10,
    } = queryDto;

    // 构建查询
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (category) {
      query.category = category;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // 计算分页
    const skip = (page - 1) * limit;

    // 执行查询
    const [requests, total] = await Promise.all([
      this.helpRequestModel
        .find(query)
        .populate('user', 'username email')
        .populate('assignedTo', 'username email')
        .sort({ status: 1, priority: -1, updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      this.helpRequestModel.countDocuments(query),
    ]);

    return {
      requests,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  /**
   * 更新帮助请求
   */
  async update(
    id: string,
    updateHelpRequestDto: UpdateHelpRequestDto,
    userId?: string,
  ): Promise<HelpRequestDocument> {
    const helpRequest = await this.findById(id);

    // 如果提供了userId，验证用户是否是请求的所有者
    if (
      userId &&
      helpRequest.user.toString() !== userId &&
      !helpRequest.assignedTo?.toString() !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this help request',
      );
    }

    // 更新字段
    if (updateHelpRequestDto.title !== undefined)
      helpRequest.title = updateHelpRequestDto.title;
    if (updateHelpRequestDto.issue !== undefined)
      helpRequest.issue = updateHelpRequestDto.issue;
    if (updateHelpRequestDto.category !== undefined)
      helpRequest.category = updateHelpRequestDto.category;
    if (updateHelpRequestDto.priority !== undefined)
      helpRequest.priority = updateHelpRequestDto.priority;

    // 更新状态
    if (updateHelpRequestDto.status !== undefined) {
      helpRequest.status = updateHelpRequestDto.status;

      // 如果状态变为已解决或已关闭，设置解决时间
      if (
        updateHelpRequestDto.status === HelpRequestStatus.RESOLVED ||
        updateHelpRequestDto.status === HelpRequestStatus.CLOSED
      ) {
        helpRequest.resolvedAt = new Date();
      }

      // 向用户发送通知（如果状态已更改）
      await this.notificationsService.create({
        userId: helpRequest.user.toString(),
        message: `Your help request "${helpRequest.title}" status changed to ${updateHelpRequestDto.status}`,
        title: 'Help Request Update',
        action: 'View Request',
        actionUrl: `/help/${helpRequest._id}`,
      });
    }

    return helpRequest.save();
  }

  /**
   * 添加响应到帮助请求
   */
  async addResponse(
    helpRequestId: string,
    responderId: string,
    createHelpResponseDto: CreateHelpResponseDto,
  ): Promise<HelpRequestDocument> {
    const helpRequest = await this.findById(helpRequestId);

    // 验证回复者ID
    if (!Types.ObjectId.isValid(responderId)) {
      throw new BadRequestException('Invalid responder ID');
    }

    // 检查回复者是否存在
    const responder = await this.usersService.findById(responderId);

    // 创建响应
    const response: HelpResponse = {
      responder: new Types.ObjectId(responderId),
      message: createHelpResponseDto.message,
      attachments: createHelpResponseDto.attachments || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // 将响应添加到帮助请求
    helpRequest.responses.push(response);

    // 更新帮助请求状态：如果是开放状态并且回复者是支持人员或管理员，则更改为处理中
    const isSupport = responder.roles.some(
      (r) => r === UserRole.SUPPORT || r === UserRole.ADMIN,
    );

    if (helpRequest.status === HelpRequestStatus.OPEN && isSupport) {
      helpRequest.status = HelpRequestStatus.IN_PROGRESS;

      // 如果未分配，则分配给该支持人员
      if (!helpRequest.assignedTo && isSupport) {
        helpRequest.assignedTo = new Types.ObjectId(responderId);
      }
    }

    await helpRequest.save();

    // 向用户发送通知（如果不是用户自己回复）
    if (helpRequest.user.toString() !== responderId) {
      await this.notificationsService.create({
        userId: helpRequest.user.toString(),
        message: `New response to your help request "${helpRequest.title}"`,
        title: 'Help Request Response',
        action: 'View Request',
        actionUrl: `/help/${helpRequest._id}`,
      });
    }

    // 如果回复者不是负责人，且不是用户，向负责人发送通知
    if (
      helpRequest.assignedTo &&
      helpRequest.assignedTo.toString() !== responderId &&
      helpRequest.user.toString() !== helpRequest.assignedTo.toString()
    ) {
      await this.notificationsService.create({
        userId: helpRequest.assignedTo.toString(),
        message: `New response on help request "${helpRequest.title}" you're assigned to`,
        title: 'Help Request Update',
        action: 'View Request',
        actionUrl: `/admin/help/${helpRequest._id}`,
      });
    }

    return helpRequest;
  }

  /**
   * 分配帮助请求给支持人员
   */
  async assignToUser(
    helpRequestId: string,
    assignToId: string,
  ): Promise<HelpRequestDocument> {
    const helpRequest = await this.findById(helpRequestId);

    // 验证被分配人ID
    if (!Types.ObjectId.isValid(assignToId)) {
      throw new BadRequestException('Invalid assignee ID');
    }

    // 检查被分配人是否存在并具有支持或管理员角色
    const assignee = await this.usersService.findById(assignToId);
    const isSupport = assignee.roles.some(
      (r) => r === UserRole.SUPPORT || r === UserRole.ADMIN,
    );

    if (!isSupport) {
      throw new BadRequestException(
        'Assignee must be a support staff or admin',
      );
    }

    // 更新负责人
    helpRequest.assignedTo = new Types.ObjectId(assignToId);

    // 如果状态是开放的，更改为处理中
    if (helpRequest.status === HelpRequestStatus.OPEN) {
      helpRequest.status = HelpRequestStatus.IN_PROGRESS;
    }

    await helpRequest.save();

    // 向负责人发送通知
    await this.notificationsService.create({
      userId: assignToId,
      message: `You have been assigned to help request: "${helpRequest.title}"`,
      title: 'New Assignment',
      action: 'View Request',
      actionUrl: `/admin/help/${helpRequest._id}`,
    });

    // 向用户发送通知
    await this.notificationsService.create({
      userId: helpRequest.user.toString(),
      message: `Your help request "${helpRequest.title}" has been assigned to a support agent`,
      title: 'Help Request Update',
      action: 'View Request',
      actionUrl: `/help/${helpRequest._id}`,
    });

    return helpRequest;
  }

  /**
   * 获取帮助请求统计数据
   */
  async getStats(): Promise<{
    totalOpen: number;
    totalInProgress: number;
    totalResolved: number;
    totalClosed: number;
    totalUrgent: number;
    avgResolutionTimeHours: number;
  }> {
    const [
      totalOpen,
      totalInProgress,
      totalResolved,
      totalClosed,
      totalUrgent,
    ] = await Promise.all([
      this.helpRequestModel.countDocuments({ status: HelpRequestStatus.OPEN }),
      this.helpRequestModel.countDocuments({
        status: HelpRequestStatus.IN_PROGRESS,
      }),
      this.helpRequestModel.countDocuments({
        status: HelpRequestStatus.RESOLVED,
      }),
      this.helpRequestModel.countDocuments({
        status: HelpRequestStatus.CLOSED,
      }),
      this.helpRequestModel.countDocuments({ priority: 'urgent' }),
    ]);

    // 计算已解决/关闭请求的平均解决时间
    const resolvedRequests = await this.helpRequestModel.find({
      status: { $in: [HelpRequestStatus.RESOLVED, HelpRequestStatus.CLOSED] },
      resolvedAt: { $ne: null },
    });

    let totalResolutionTimeMs = 0;

    resolvedRequests.forEach((request) => {
      if (request.resolvedAt) {
        const resolutionTime =
          request.resolvedAt.getTime() - request.createdAt.getTime();
        totalResolutionTimeMs += resolutionTime;
      }
    });

    const avgResolutionTimeHours =
      resolvedRequests.length > 0
        ? totalResolutionTimeMs / resolvedRequests.length / (1000 * 60 * 60) // 转换毫秒为小时
        : 0;

    return {
      totalOpen,
      totalInProgress,
      totalResolved,
      totalClosed,
      totalUrgent,
      avgResolutionTimeHours,
    };
  }
}
