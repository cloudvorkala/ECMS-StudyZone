import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebRTCService } from './webrtc.service';
import { WebRTCSignal, MediaStreamConfig, MediaType } from './types/webrtc.types';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

interface ScreenShareSession {
  id: string;
  sharerId: string;
  groupId: string;
  status: 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  viewers: Array<{
    userId: string;
    socketId: string;
    joinedAt: Date;
  }>;
  mediaType: 'screen' | 'camera' | 'both';
  audioEnabled: boolean;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://localhost:3000',
      'http://127.0.0.1:3000',
      'https://127.0.0.1:3000',
      'http://192.168.31.97:3000',
      'https://192.168.31.97:3000',
      'http://192.168.31.20:3000',
      'https://192.168.31.20:3000',
      'http://192.168.31.*:3000',
      'https://192.168.31.*:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  namespace: '/webrtc',
  transports: ['websocket', 'polling'],
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class WebRTCGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(WebRTCGateway.name);
  private readonly screenShareSessions = new Map<string, ScreenShareSession>();

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly webrtcService: WebRTCService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebRTC Gateway initialized');
    this.cleanupAllConnections(server);
  }

  private cleanupAllConnections(server: Server) {
    this.logger.log('Cleaning up all connections...');
    this.screenShareSessions.clear();
    if (server.sockets) {
      const sockets = server.sockets.sockets;
      if (sockets) {
        sockets.forEach((socket) => {
          socket.disconnect(true);
        });
      }
    }
    this.logger.log('All connections cleaned up');
  }

  async handleConnection(client: Socket) {
    try {
      this.logger.log('=================================');
      this.logger.log(`Client connected: ${client.id}`);
      const token = client.handshake.query.token;
      const groupId = client.handshake.query.groupId;
      const userId = client.handshake.query.userId;
      const role = client.handshake.query.role;
      this.logger.log('Connection details:', { token: !!token, groupId, userId, role });

      // Clean up old connections for the same user
      if (userId) {
        const sockets = await this.server.fetchSockets();
        for (const socket of sockets) {
          if (socket.handshake.query.userId === userId && socket.id !== client.id) {
            this.logger.log(`Disconnecting old connection for user ${userId}: ${socket.id}`);
            socket.disconnect(true);
          }
        }
      }

      // Send connection confirmation
      client.emit('connected', { socketId: client.id });
      this.logger.log('=================================');
    } catch (error) {
      this.logger.error('Error in handleConnection:', error);
      client.emit('error', { message: 'Connection failed' });
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      this.logger.log('=================================');
      this.logger.log(`Client disconnected: ${client.id}`);
      const groupId = client.handshake.query.groupId as string;
      const userId = client.handshake.query.userId as string;

      if (groupId && userId) {
        // Check if user was sharing screen
        for (const [sessionId, session] of this.screenShareSessions) {
          if (session.sharerId === userId) {
            this.logger.log(`Sharer disconnected, ending session: ${sessionId}`);
            this.handleEndScreenShare(client, { sessionId });
          } else {
            // Remove from viewers
            session.viewers = session.viewers.filter(v => v.userId !== userId);
          }
        }
      }
      this.logger.log('=================================');
    } catch (error) {
      this.logger.error('Error in handleDisconnect:', error);
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('join-room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    try {
      this.logger.log('=================================');
      this.logger.log(`Client ${client.id} joining room: ${data.groupId}`);

      // Join the room
      await client.join(data.groupId);

      // Get all clients in the room
      const roomClients = await this.server.in(data.groupId).fetchSockets();
      this.logger.log(`Room ${data.groupId} now has ${roomClients.length} clients`);

      // Send confirmation back to client
      client.emit('joined-room', {
        groupId: data.groupId,
        clientCount: roomClients.length
      });

      // Check if there's an active screen share session for this group
      for (const [sessionId, session] of this.screenShareSessions) {
        if (session.groupId === data.groupId && session.status === 'active') {
          this.logger.log(`Informing new client about active session: ${sessionId}`);
          client.emit('screen-share-started', session);
        }
      }

      this.logger.log('=================================');
      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleJoinRoom:', error);
      client.emit('error', { message: 'Failed to join room' });
      return { success: false, error: (error as Error).message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('start-screen-share')
  async handleStartScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; groupId: string; mediaType?: MediaType },
  ) {
    try {
      this.logger.log('Starting screen share for group:');
      this.logger.log(data.groupId);
      this.logger.log('Screen share request details:');
      this.logger.log(data);

      // Create session
      const session: ScreenShareSession = {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sharerId: data.userId,
        groupId: data.groupId,
        status: 'active',
        startTime: new Date(),
        viewers: [],
        mediaType: data.mediaType || 'screen',
        audioEnabled: data.mediaType === 'both',
      };

      // Store session
      this.screenShareSessions.set(session.id, session);
      this.logger.log('Created session:');
      this.logger.log(session);

      // Join session room
      await client.join(`session-${session.id}`);
      this.logger.log('Client joined session room:');
      this.logger.log(`session-${session.id}`);

      // Broadcast to all clients in the group
      this.server.to(data.groupId).emit('screen-share-started', session);
      this.logger.log('Broadcasted screen-share-started to group:');
      this.logger.log(data.groupId);

      return session;
    } catch (error) {
      this.logger.error('Error in handleStartScreenShare:', error);
      client.emit('error', { message: 'Failed to start screen share' });
      throw error;
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('join-as-viewer')
  async handleJoinAsViewer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; userId: string; groupId: string },
  ) {
    try {
      this.logger.log('Viewer joining session:', data);

      const session = this.screenShareSessions.get(data.sessionId);
      if (!session) {
        this.logger.log('Session not found:', data.sessionId);
        client.emit('error', { message: 'Session not found' });
        return { success: false, error: 'Session not found' };
      }

      // Add viewer to session
      if (!session.viewers.find(v => v.userId === data.userId)) {
        session.viewers.push({
          userId: data.userId,
          socketId: client.id,
          joinedAt: new Date(),
        });
      }

      // Join the session room
      await client.join(`session-${data.sessionId}`);

      this.logger.log('Viewer added to session:', {
        sessionId: data.sessionId,
        viewerCount: session.viewers.length
      });

      // Find sharer by searching through all room sockets
      const roomSockets = await this.server.in(data.groupId).fetchSockets();
      const sharerSocket = roomSockets.find(
        socket => socket.handshake.query.userId === session.sharerId
      );

      if (sharerSocket) {
        sharerSocket.emit('viewer-joined', {
          sessionId: data.sessionId,
          viewerId: data.userId,
          viewerSocketId: client.id
        });
        this.logger.log('Notified sharer about new viewer');
      } else {
        this.logger.warn('Sharer socket not found in room');
      }

      // Confirm to viewer
      client.emit('viewer-joined', {
        sessionId: data.sessionId,
        status: 'success'
      });

      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleJoinAsViewer:', error);
      client.emit('error', { message: 'Failed to join as viewer' });
      return { success: false, error: (error as Error).message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('offer')
  async handleOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; offer: RTCSessionDescriptionInit; targetId: string },
  ) {
    try {
      this.logger.log('Relaying offer from sharer to viewer');

      const session = this.screenShareSessions.get(data.sessionId);
      if (!session) return;

      // Find target viewer socket
      const targetViewer = session.viewers.find(v => v.userId === data.targetId);
      if (targetViewer) {
        // Get socket by ID from server
        const allSockets = await this.server.fetchSockets();
        const targetSocket = allSockets.find(s => s.id === targetViewer.socketId);

        if (targetSocket) {
          targetSocket.emit('offer', {
            sessionId: data.sessionId,
            offer: data.offer,
            fromUserId: session.sharerId
          });
          this.logger.log('Offer relayed to viewer');
        } else {
          this.logger.warn('Target viewer socket not found');
        }
      } else {
        this.logger.warn('Target viewer not found in session');
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleOffer:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('answer')
  async handleAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; answer: RTCSessionDescriptionInit; targetId: string },
  ) {
    try {
      this.logger.log('Relaying answer from viewer to sharer');

      const session = this.screenShareSessions.get(data.sessionId);
      if (!session) return;

      // Get the viewer's userId from the client socket
      const viewerUserId = client.handshake.query.userId as string;

      // Find sharer socket using room-based search
      const roomSockets = await this.server.in(session.groupId).fetchSockets();
      const sharerSocket = roomSockets.find(
        socket => socket.handshake.query.userId === session.sharerId
      );

      if (sharerSocket) {
        sharerSocket.emit('answer', {
          sessionId: data.sessionId,
          answer: data.answer,
          fromUserId: viewerUserId  // 使用viewer的ID而不是targetId
        });
        this.logger.log('Answer relayed to sharer from viewer:', viewerUserId);
      } else {
        this.logger.warn('Sharer socket not found');
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleAnswer:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('ice-candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; candidate: RTCIceCandidateInit; targetId: string },
  ) {
    try {
      this.logger.log('Relaying ICE candidate');

      const session = this.screenShareSessions.get(data.sessionId);
      if (!session) return;

      // Get sender's info from socket handshake
      const senderUserId = client.handshake.query.userId as string;

      if (senderUserId === session.sharerId) {
        // Sharer sending to viewer
        const targetViewer = session.viewers.find(v => v.userId === data.targetId);
        if (targetViewer) {
          const allSockets = await this.server.fetchSockets();
          const targetSocket = allSockets.find(s => s.id === targetViewer.socketId);

          if (targetSocket) {
            targetSocket.emit('ice-candidate', {
              sessionId: data.sessionId,
              candidate: data.candidate
            });
            this.logger.log('ICE candidate relayed to viewer');
          } else {
            this.logger.warn('Target viewer socket not found');
          }
        }
      } else {
        // Viewer sending to sharer
        const roomSockets = await this.server.in(session.groupId).fetchSockets();
        const sharerSocket = roomSockets.find(
          socket => socket.handshake.query.userId === session.sharerId
        );

        if (sharerSocket) {
          sharerSocket.emit('ice-candidate', {
            sessionId: data.sessionId,
            candidate: data.candidate
          });
          this.logger.log('ICE candidate relayed to sharer');
        } else {
          this.logger.warn('Sharer socket not found');
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleIceCandidate:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('end-screen-share')
  async handleEndScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    try {
      this.logger.log('Ending screen share session:', data.sessionId);

      const session = this.screenShareSessions.get(data.sessionId);
      if (!session) {
        this.logger.warn(`Session not found: ${data.sessionId}`);
        return { success: false, error: 'Session not found' };
      }

      // Update session status
      session.status = 'ended';
      session.endTime = new Date();

      // Broadcast to all clients in the group
      this.server.to(session.groupId).emit('screen-share-ended', session);
      this.logger.log('Broadcasted screen-share-ended to group:', session.groupId);

      // Clean up
      this.screenShareSessions.delete(data.sessionId);

      // Leave session room
      const sessionSockets = await this.server.in(`session-${data.sessionId}`).fetchSockets();
      sessionSockets.forEach(socket => socket.leave(`session-${data.sessionId}`));

      return { success: true, session };
    } catch (error) {
      this.logger.error('Error in handleEndScreenShare:', error);
      client.emit('error', { message: 'Failed to end screen share' });
      throw error;
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('get-active-sessions')
  async handleGetActiveSessions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    try {
      const sessions = Array.from(this.screenShareSessions.values())
        .filter(session => session.groupId === data.groupId && session.status === 'active');

      return { success: true, sessions };
    } catch (error) {
      this.logger.error('Error in handleGetActiveSessions:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  // Test endpoint for debugging
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket) {
    this.logger.log(`Ping received from client: ${client.id}`);
    return { pong: true, timestamp: new Date() };
  }
}