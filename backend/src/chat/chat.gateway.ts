import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './chat.service';
import { StudyGroupsService } from '../study-groups/study-groups.service';
import { ChatMessage } from './schemas/chat-message.schema';
import { User } from '../users/schemas/user.schema';
import { Document } from 'mongoose';

interface ServerToClientEvents {
  newMessage: (message: ChatMessage) => void;
  groupMessages: (messages: ChatMessage[]) => void;
  userTyping: (data: { userId: string; isTyping: boolean }) => void;
  error: (error: string) => void;
  pong: () => void;
}

interface ClientToServerEvents {
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  sendMessage: (payload: { groupId: string; content: string }) => void;
  typing: (payload: { groupId: string; isTyping: boolean }) => void;
  ping: () => void;
}

type ChatSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['https://localhost:3000', 'https://localhost:3001'],
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server<ClientToServerEvents, ServerToClientEvents>;
  private readonly logger = new Logger(ChatGateway.name);
  private userSockets: Map<string, Set<string>> = new Map(); // userId -> Set of socketIds
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private chatService: ChatService,
    private studyGroupsService: StudyGroupsService,
  ) {}

  async handleConnection(client: ChatSocket) {
    try {
      const userId = client.handshake.auth.userId;
      if (!userId) {
        client.disconnect();
        return;
      }

      // Store socket mapping
      this.socketUsers.set(client.id, userId);
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      const userSockets = this.userSockets.get(userId);
      if (userSockets) {
        userSockets.add(client.id);
      }

      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Connection error: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred during connection');
      }
      client.disconnect();
    }
  }

  handleDisconnect(client: ChatSocket) {
    try {
      const userId = this.socketUsers.get(client.id);
      if (userId) {
        const userSockets = this.userSockets.get(userId);
        if (userSockets) {
          userSockets.delete(client.id);
          if (userSockets.size === 0) {
            this.userSockets.delete(userId);
          }
        }
        this.socketUsers.delete(client.id);
      }
      this.logger.log(`Client disconnected: ${client.id}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Disconnection error: ${error.message}`);
      } else {
        this.logger.error('Unknown error occurred during disconnection');
      }
    }
  }

  @SubscribeMessage('joinGroup')
  async handleJoinGroup(client: ChatSocket, groupId: string) {
    try {
      const userId = this.socketUsers.get(client.id);
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Verify user is in the group
      const group = await this.studyGroupsService.findOne(groupId);
      const isInGroup = group.students.some(student => {
        if (student && typeof student === 'object' && '_id' in student) {
          return (student as { _id: { toString: () => string } })._id.toString() === userId;
        }
        return student.toString() === userId;
      }) || (group.mentor && typeof group.mentor === 'object' && '_id' in group.mentor ? (group.mentor as { _id: { toString: () => string } })._id.toString() : group.mentor.toString()) === userId;

      if (!isInGroup) {
        throw new Error('User is not a member of this group');
      }

      // Join the room
      client.join(`group:${groupId}`);
      this.logger.log(`User ${userId} joined group ${groupId}`);

      // Send recent messages
      const messages = await this.chatService.getGroupMessages(groupId);
      client.emit('groupMessages', messages);

      // Mark messages as read
      await this.chatService.markAllMessagesAsRead(groupId, userId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Join group error: ${error.message}`);
        client.emit('error', error.message);
      } else {
        this.logger.error('Unknown error occurred while joining group');
        client.emit('error', 'An unknown error occurred');
      }
    }
  }

  @SubscribeMessage('leaveGroup')
  handleLeaveGroup(client: ChatSocket, groupId: string) {
    client.leave(`group:${groupId}`);
    this.logger.log(`User left group ${groupId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(client: ChatSocket, payload: { groupId: string; content: string }) {
    try {
      const userId = this.socketUsers.get(client.id);
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Verify user is in the group
      const group = await this.studyGroupsService.findOne(payload.groupId);
      const isInGroup = group.students.some(student => {
        if (student && typeof student === 'object' && '_id' in student) {
          return (student as { _id: { toString: () => string } })._id.toString() === userId;
        }
        return student.toString() === userId;
      }) || (group.mentor && typeof group.mentor === 'object' && '_id' in group.mentor ? (group.mentor as { _id: { toString: () => string } })._id.toString() : group.mentor.toString()) === userId;

      if (!isInGroup) {
        throw new Error('User is not a member of this group');
      }

      const message = await this.chatService.createMessage(
        payload.groupId,
        userId,
        payload.content
      );

      // Broadcast to all users in the group
      this.server.to(`group:${payload.groupId}`).emit('newMessage', message);
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Send message error: ${error.message}`);
        client.emit('error', error.message);
      } else {
        this.logger.error('Unknown error occurred while sending message');
        client.emit('error', 'An unknown error occurred');
      }
    }
  }

  @SubscribeMessage('typing')
  handleTyping(client: ChatSocket, payload: { groupId: string; isTyping: boolean }) {
    const userId = this.socketUsers.get(client.id);
    if (userId) {
      client.to(`group:${payload.groupId}`).emit('userTyping', {
        userId,
        isTyping: payload.isTyping,
      });
    }
  }

  @SubscribeMessage('ping')
  handlePing(client: ChatSocket) {
    client.emit('pong');
  }
}