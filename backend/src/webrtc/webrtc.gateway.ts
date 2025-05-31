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
  viewers: string[];
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
  private readonly activeSessions = new Map<string, ScreenShareSession>();
  private readonly roomClients = new Map<string, Set<string>>();

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
    this.roomClients.clear();
    this.activeSessions.clear();
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
        for (const [sessionId, session] of this.activeSessions) {
          if (session.sharerId === userId) {
            this.logger.log(`Sharer disconnected, ending session: ${sessionId}`);
            this.handleEndScreenShare(client, { sessionId });
          }
        }

        // Remove from room clients tracking
        if (this.roomClients.has(groupId)) {
          this.roomClients.get(groupId)?.delete(client.id);
          if (this.roomClients.get(groupId)?.size === 0) {
            this.roomClients.delete(groupId);
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

      // Check if client is already in the room
      const rooms = Array.from(client.rooms);
      if (rooms.includes(data.groupId)) {
        this.logger.log(`Client ${client.id} is already in room: ${data.groupId}`);
        client.emit('joined-room', { groupId: data.groupId, alreadyJoined: true });
        return { success: true };
      }

      // Join the room
      await client.join(data.groupId);

      // Track room clients
      if (!this.roomClients.has(data.groupId)) {
        this.roomClients.set(data.groupId, new Set());
      }
      this.roomClients.get(data.groupId)?.add(client.id);

      // Get all clients in the room
      const roomClients = await this.server.in(data.groupId).fetchSockets();
      this.logger.log(`Room ${data.groupId} now has ${roomClients.length} clients`);

      // Send confirmation back to client
      client.emit('joined-room', {
        groupId: data.groupId,
        clientCount: roomClients.length
      });

      // Check if there's an active screen share session for this group
      for (const [sessionId, session] of this.activeSessions) {
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
      this.logger.log('Starting screen share for group:', data.groupId);
      this.logger.log('Screen share request details:', data);

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
      this.activeSessions.set(session.id, session);
      this.logger.log('Created session:', session);

      // Join session room
      await client.join(session.id);
      this.logger.log('Client joined session room:', session.id);

      // Broadcast to all clients in the group
      this.server.to(data.groupId).emit('screen-share-started', session);
      this.logger.log('Broadcasted screen-share-started to group:', data.groupId);

      return session;
    } catch (error) {
      this.logger.error('Error in handleStartScreenShare:', error);
      client.emit('error', { message: 'Failed to start screen share' });
      throw error;
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

      const session = this.activeSessions.get(data.sessionId);
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
      this.activeSessions.delete(data.sessionId);

      // Leave session room
      const sessionSockets = await this.server.in(data.sessionId).fetchSockets();
      sessionSockets.forEach(socket => socket.leave(data.sessionId));

      return { success: true, session };
    } catch (error) {
      this.logger.error('Error in handleEndScreenShare:', error);
      client.emit('error', { message: 'Failed to end screen share' });
      throw error;
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('webrtc-signal')
  async handleWebRTCSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() signal: any,
  ) {
    try {
      this.logger.log('Received WebRTC signal:', {
        type: signal.type,
        from: signal.from,
        to: signal.to,
        sessionId: signal.sessionId,
      });

      // Validate signal
      if (!signal.type || !signal.from || !signal.sessionId) {
        throw new Error('Invalid signal format');
      }

      // Handle different signal types
      if (signal.to === 'all') {
        // Broadcast to all in the session except sender
        client.to(signal.sessionId).emit('webrtc-signal', signal);
        this.logger.log(`Broadcasted ${signal.type} signal to session: ${signal.sessionId}`);
      } else if (signal.to) {
        // Send to specific client
        const targetSockets = await this.server.fetchSockets();
        const targetSocket = targetSockets.find(
          s => s.handshake.query.userId === signal.to
        );

        if (targetSocket) {
          targetSocket.emit('webrtc-signal', signal);
          this.logger.log(`Sent ${signal.type} signal to user: ${signal.to}`);
        } else {
          this.logger.warn(`Target socket not found for user: ${signal.to}`);
        }
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleWebRTCSignal:', error);
      client.emit('error', { message: 'Failed to process WebRTC signal' });
      return { success: false, error: (error as Error).message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('get-active-sessions')
  async handleGetActiveSessions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { groupId: string },
  ) {
    try {
      const sessions = Array.from(this.activeSessions.values())
        .filter(session => session.groupId === data.groupId && session.status === 'active');

      return { success: true, sessions };
    } catch (error) {
      this.logger.error('Error in handleGetActiveSessions:', error);
      return { success: false, error: (error as Error).message };
    }
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('request-offer')
  async handleRequestOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; from: string; to: string },
  ) {
    try {
      this.logger.log('Requesting offer:', data);

      // Get the session
      const session = this.activeSessions.get(data.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Find the sharer's socket
      const sharerSockets = await this.server.fetchSockets();
      const sharerSocket = sharerSockets.find(
        s => s.handshake.query.userId === data.to
      );

      if (sharerSocket) {
        // Forward the request to the sharer
        sharerSocket.emit('offer-requested', {
          sessionId: data.sessionId,
          from: data.from,
          to: data.to
        });
        this.logger.log(`Forwarded offer request to sharer: ${data.to}`);
      } else {
        this.logger.warn(`Sharer socket not found: ${data.to}`);
      }

      return { success: true };
    } catch (error) {
      this.logger.error('Error in handleRequestOffer:', error);
      client.emit('error', { message: 'Failed to request offer' });
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