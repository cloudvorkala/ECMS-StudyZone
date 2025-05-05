// src/notifications/gateways/notifications.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WsResponse
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { Logger } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { ConfigService } from '@nestjs/config';
  import { NotificationsService } from '../notifications.service';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // 在生产环境中应该设置为真实的前端域名
    },
    namespace: '/notifications'
  })
  export class NotificationsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private readonly logger = new Logger(NotificationsGateway.name);
    private userSocketMap = new Map<string, string[]>();
  
    constructor(
      private jwtService: JwtService,
      private configService: ConfigService,
      private notificationsService: NotificationsService
    ) {}
  
    // Gateway初始化后调用
    afterInit(server: Server) {
      this.logger.log('Notifications WebSocket Gateway initialized');
    }
  
    // 客户端连接时调用
    async handleConnection(client: Socket) {
      try {
        // 获取token
        const token = client.handshake.auth.token || 
                     client.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          this.handleDisconnect(client);
          return;
        }
  
        // 验证token
        const payload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('jwt.secret')
        });
  
        const userId = payload.sub;
  
        // 存储socket id与userId的关系
        if (!this.userSocketMap.has(userId)) {
          this.userSocketMap.set(userId, []);
        }
        this.userSocketMap.get(userId).push(client.id);
  
        // 加入以userId命名的房间
        client.join(`user:${userId}`);
  
        // 获取未读通知计数
        const { count } = await this.notificationsService.getUnreadCount(userId);
  
        // 发送未读通知计数给客户端
        client.emit('unread_count', { count });
  
        this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
      } catch (error) {
        this.logger.error(`Connection error: ${error.message}`);
        // 认证失败，断开连接
        client.disconnect();
      }
    }
  
    // 客户端断开连接时调用
    handleDisconnect(client: Socket) {
      // 从用户socket映射中删除
      for (const [userId, socketIds] of this.userSocketMap.entries()) {
        const index = socketIds.indexOf(client.id);
        if (index > -1) {
          socketIds.splice(index, 1);
          // 如果用户没有活跃连接，则从映射中删除
          if (socketIds.length === 0) {
            this.userSocketMap.delete(userId);
          }
          break;
        }
      }
  
      this.logger.log(`Client disconnected: ${client.id}`);
    }
  
    // 发送通知到指定用户
    sendNotificationToUser(userId: string, notification: any) {
      this.server.to(`user:${userId}`).emit('notification', notification);
      
      // 更新未读通知计数
      this.notificationsService.getUnreadCount(userId).then(data => {
        this.server.to(`user:${userId}`).emit('unread_count', { count: data.count });
      });
    }
  
    // 标记通知为已读的消息处理函数
    @SubscribeMessage('mark_as_read')
    async handleMarkAsRead(client: Socket, payload: { notificationId: string }) {
      try {
        const token = client.handshake.auth.token || 
                      client.handshake.headers.authorization?.split(' ')[1];
        
        const jwtPayload = this.jwtService.verify(token, {
          secret: this.configService.get<string>('jwt.secret')
        });
  
        const userId = jwtPayload.sub;
        
        // 标记通知为已读
        await this.notificationsService.markAsRead(payload.notificationId, userId);
        
        // 获取新的未读计数
        const { count } = await this.notificationsService.getUnreadCount(userId);
        
        // 向客户端发送更新后的未读计数
        return { event: 'unread_count', data: { count } };
      } catch (error) {
        this.logger.error(`Mark as read error: ${error.message}`);
        return { event: 'error', data: { message: 'Failed to mark notification as read' } };
      }
    }
  }