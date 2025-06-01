import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete, Logger, BadRequestException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Request() req, @Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.create(req.user.id, createNotificationDto);
  }

  @Get()
  async findAll() {
    return this.notificationsService.findAll();
  }

  @Get('active')
  async findActive() {
    return this.notificationsService.findActive();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(id);
  }

  @Post(':id/read')
  async markAsRead(@Request() req, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deactivate(@Request() req, @Param('id') id: string) {
    this.logger.debug(`Attempting to deactivate notification ${id} by admin ${req.user.id}`);
    try {
      const result = await this.notificationsService.deactivate(id, req.user.id);
      this.logger.debug(`Successfully deactivated notification ${id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error deactivating notification ${id}:`, error);
      throw error;
    }
  }
}