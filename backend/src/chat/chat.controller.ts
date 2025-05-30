import { Controller, Get, Delete, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('chat')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('groups/:groupId/messages')
  @Roles(UserRole.STUDENT, UserRole.MENTOR)
  async getGroupMessages(
    @Param('groupId') groupId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 50,
    @Request() req,
  ) {
    return this.chatService.getGroupMessages(groupId, page, limit);
  }

  @Delete('messages/:messageId')
  @Roles(UserRole.STUDENT, UserRole.MENTOR)
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Request() req,
  ) {
    return this.chatService.deleteMessage(messageId, req.user.id);
  }

  @Get('groups/:groupId/unread')
  @Roles(UserRole.STUDENT, UserRole.MENTOR)
  async getUnreadCount(
    @Param('groupId') groupId: string,
    @Request() req,
  ) {
    return this.chatService.getUnreadCount(groupId, req.user.id);
  }
}