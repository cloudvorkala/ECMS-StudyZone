import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatMessage } from './schemas/chat-message.schema';
import { StudyGroupsService } from '../study-groups/study-groups.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    private studyGroupsService: StudyGroupsService,
    private usersService: UsersService,
  ) {}

  async createMessage(groupId: string, senderId: string, content: string): Promise<ChatMessage> {
    try {
      // Verify user is in the group
      const group = await this.studyGroupsService.findOne(groupId);
      const isInGroup = group.students.some(student => {
        if (student && typeof student === 'object' && '_id' in student) {
          return (student as { _id: { toString: () => string } })._id.toString() === senderId;
        }
        return student.toString() === senderId;
      }) || (group.mentor && typeof group.mentor === 'object' && '_id' in group.mentor ? (group.mentor as { _id: { toString: () => string } })._id.toString() : group.mentor.toString()) === senderId;

      if (!isInGroup) {
        throw new Error('User is not a member of this group');
      }

      // Get sender's name
      const sender = await this.usersService.findById(senderId);
      if (!sender) {
        throw new Error('Sender not found');
      }

      const message = await this.chatMessageModel.create({
        groupId,
        senderId,
        senderName: sender.fullName,
        content,
        readBy: [senderId], // Mark as read by sender
      });

      return message;
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error creating message: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while creating message');
      }
      throw error;
    }
  }

  async getGroupMessages(groupId: string, page = 1, limit = 50): Promise<ChatMessage[]> {
    try {
      const skip = (page - 1) * limit;
      return this.chatMessageModel
        .find({ groupId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error getting group messages: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while getting group messages');
      }
      throw error;
    }
  }

  async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    try {
      await this.chatMessageModel.findByIdAndUpdate(
        messageId,
        { $addToSet: { readBy: userId } }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error marking message as read: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while marking message as read');
      }
      throw error;
    }
  }

  async markAllMessagesAsRead(groupId: string, userId: string): Promise<void> {
    try {
      await this.chatMessageModel.updateMany(
        { groupId, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error marking all messages as read: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while marking all messages as read');
      }
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      const message = await this.chatMessageModel.findById(messageId);
      if (!message) {
        throw new NotFoundException('Message not found');
      }

      if (message.senderId.toString() !== userId) {
        throw new ForbiddenException('Not authorized to delete this message');
      }

      await message.deleteOne();
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error deleting message: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while deleting message');
      }
      throw error;
    }
  }

  async getUnreadCount(groupId: string, userId: string): Promise<number> {
    try {
      return this.chatMessageModel.countDocuments({
        groupId,
        readBy: { $ne: userId }
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Error getting unread count: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred while getting unread count');
      }
      throw error;
    }
  }
}