import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebRTCService } from './webrtc.service';
import { WebRTCSignal, MediaStreamConfig, MediaType } from './types/webrtc.types';
import { UseGuards } from '@nestjs/common';
import { WsJwtAuthGuard } from '../auth/guards/ws-jwt-auth.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'webrtc',
  transports: ['websocket'],
  path: '/webrtc',
  serveClient: false,
  pingInterval: 10000,
  pingTimeout: 5000,
})
export class WebRTCGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly webrtcService: WebRTCService) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    const token = client.handshake.query.token;
    console.log('Connection token:', token);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('start-screen-share')
  async handleStartScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string; mediaType?: MediaType },
  ) {
    const session = this.webrtcService.startScreenShare(data.userId, data.mediaType);
    client.join(session.id);
    return session;
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('end-screen-share')
  async handleEndScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    const session = this.webrtcService.endScreenShare(data.sessionId);
    if (session) {
      this.server.to(session.id).emit('screen-share-ended', session);
    }
    return session;
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('join-screen-share')
  async handleJoinScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; userId: string },
  ) {
    const success = this.webrtcService.addViewer(data.sessionId, data.userId);
    if (success) {
      client.join(data.sessionId);
      this.server.to(data.sessionId).emit('viewer-joined', {
        sessionId: data.sessionId,
        viewerId: data.userId,
      });
    }
    return { success };
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('leave-screen-share')
  async handleLeaveScreenShare(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; userId: string },
  ) {
    const success = this.webrtcService.removeViewer(data.sessionId, data.userId);
    if (success) {
      client.leave(data.sessionId);
      this.server.to(data.sessionId).emit('viewer-left', {
        sessionId: data.sessionId,
        viewerId: data.userId,
      });
    }
    return { success };
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('webrtc-signal')
  async handleWebRTCSignal(
    @ConnectedSocket() client: Socket,
    @MessageBody() signal: WebRTCSignal,
  ) {
    this.webrtcService.handleSignal(signal);
    return { success: true };
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('get-active-sessions')
  async handleGetActiveSessions() {
    return this.webrtcService.getActiveSessions();
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('get-media-config')
  async handleGetMediaConfig() {
    return this.webrtcService.getMediaConfig();
  }

  @UseGuards(WsJwtAuthGuard)
  @SubscribeMessage('update-media-config')
  async handleUpdateMediaConfig(
    @ConnectedSocket() client: Socket,
    @MessageBody() config: Partial<MediaStreamConfig>,
  ) {
    const updatedConfig = this.webrtcService.updateMediaConfig(config);
    this.server.emit('media-config-updated', updatedConfig);
    return updatedConfig;
  }
}