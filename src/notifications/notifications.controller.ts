// src/notifications/notifications.controller.ts
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param, 
    Delete, 
    UseGuards, 
    Query, 
    Put 
  } from '@nestjs/common';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiBearerAuth 
  } from '@nestjs/swagger';
  import { NotificationsService } from './notifications.service';
  import { CreateNotificationDto, NotificationQueryDto } from './dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
  import { RolesGuard } from '../common/guards/roles.guard';
  import { Roles } from '../common/decorators/roles.decorator';
  import { CurrentUser } from '../common/decorators/current-user.decorator';
  import { UserRole } from '../users/schemas/user.schema';
  
  @ApiTags('notifications')
  @Controller('notifications')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) {}
  
    @Get()
    @ApiOperation({ summary: 'Get user notifications' })
    @ApiResponse({
      status: 200,
      description: 'Returns notifications for the authenticated user'
    })
    async findAll(
      @CurrentUser() user,
      @Query() queryDto: NotificationQueryDto
    ) {
      return this.notificationsService.findAllForUser(user.id, queryDto);
    }
  
    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    @ApiResponse({
      status: 200,
      description: 'Returns the number of unread notifications'
    })
    async getUnreadCount(@CurrentUser() user) {
      return this.notificationsService.getUnreadCount(user.id);
    }
  
    @Put(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    @ApiResponse({
      status: 200,
      description: 'Notification marked as read'
    })
    async markAsRead(
      @CurrentUser() user,
      @Param('id') id: string
    ) {
      await this.notificationsService.markAsRead(id, user.id);
      return { message: 'Notification marked as read' };
    }
  
    @Put('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    @ApiResponse({
      status: 200,
      description: 'All notifications marked as read'
    })
    async markAllAsRead(@CurrentUser() user) {
      const result = await this.notificationsService.markAllAsRead(user.id);
      return { 
        message: 'All notifications marked as read',
        count: result.count
      };
    }
  
    @Delete(':id')
    @ApiOperation({ summary: 'Delete notification' })
    @ApiResponse({
      status: 200,
      description: 'Notification deleted'
    })
    async remove(
      @CurrentUser() user,
      @Param('id') id: string
    ) {
      await this.notificationsService.remove(id, user.id);
      return { message: 'Notification deleted' };
    }
  
    // Admin endpoints
    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPPORT)
    @ApiOperation({ summary: 'Create notification (Admin only)' })
    @ApiResponse({
      status: 201,
      description: 'Notification created'
    })
    async create(@Body() createNotificationDto: CreateNotificationDto) {
      const notification = await this.notificationsService.create(createNotificationDto);
      return {
        message: 'Notification created',
        notification
      };
    }
  
    @Post('system')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Send system notification to multiple users (Admin only)' })
    @ApiResponse({
      status: 201,
      description: 'System notification sent to users'
    })
    async sendSystemNotification(
      @Body() body: {
        userIds: string[];
        message: string;
        title: string;
      }
    ) {
      const { userIds, message, title } = body;
      
      const notifications = await this.notificationsService.createNotificationForMultipleUsers(
        userIds,
        message,
        title
      );
      
      return {
        message: `Notification sent to ${notifications.length} users`,
        count: notifications.length
      };
    }
  }