import { Injectable } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { WebRTCSignal, ScreenShareSession, WebRTCConnection, MediaStreamConfig, MediaType } from './types/webrtc.types';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'webrtc',
})
export class WebRTCService {
  @WebSocketServer()
  server!: Server;

  private activeSessions: Map<string, ScreenShareSession> = new Map();
  private activeConnections: Map<string, WebRTCConnection> = new Map();
  private defaultMediaConfig: MediaStreamConfig = {
    audio: {
      sampleRate: 48000,
      channelCount: 2,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: {
      width: 1920,
      height: 1080,
      frameRate: 30,
    },
  };

  // start screen share
  startScreenShare(userId: string, mediaType: MediaType = 'both'): ScreenShareSession {
    const session: ScreenShareSession = {
      id: uuidv4(),
      sharerId: userId,
      viewers: [],
      startTime: new Date(),
      status: 'active',
      mediaType,
      audioEnabled: mediaType === 'both' || mediaType === 'camera',
    };

    this.activeSessions.set(session.id, session);
    return session;
  }

  // end screen share
  endScreenShare(sessionId: string): ScreenShareSession | null {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.endTime = new Date();
      this.activeSessions.delete(sessionId);
      return session;
    }
    return null;
  }

  // add viewer
  addViewer(sessionId: string, viewerId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'active') {
      session.viewers.push(viewerId);
      return true;
    }
    return false;
  }

  // remove viewer
  removeViewer(sessionId: string, viewerId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.viewers = session.viewers.filter(id => id !== viewerId);
      return true;
    }
    return false;
  }

  // handle WebRTC signal
  handleSignal(signal: WebRTCSignal): void {
    if (signal.targetUserId) {
      this.server.to(signal.targetUserId).emit('webrtc-signal', signal);
    }
  }

  // create new WebRTC connection
  createConnection(sharerId: string, viewerId: string, mediaType: MediaType = 'both'): WebRTCConnection {
    const connection: WebRTCConnection = {
      id: uuidv4(),
      sharerId,
      viewerId,
      status: 'connecting',
      startTime: new Date(),
      mediaType,
      audioEnabled: mediaType === 'both' || mediaType === 'camera',
    };

    this.activeConnections.set(connection.id, connection);
    return connection;
  }

  // update connection status
  updateConnectionStatus(connectionId: string, status: 'connected' | 'disconnected'): WebRTCConnection | null {
    const connection = this.activeConnections.get(connectionId);
    if (connection) {
      connection.status = status;
      if (status === 'disconnected') {
        connection.endTime = new Date();
      }
      return connection;
    }
    return null;
  }

  // get active screen share sessions
  getActiveSessions(): ScreenShareSession[] {
    return Array.from(this.activeSessions.values());
  }

  // get active connections
  getActiveConnections(): WebRTCConnection[] {
    return Array.from(this.activeConnections.values());
  }

  // get media stream configuration
  getMediaConfig(): MediaStreamConfig {
    return this.defaultMediaConfig;
  }

  // update media stream configuration
  updateMediaConfig(config: Partial<MediaStreamConfig>): MediaStreamConfig {
    this.defaultMediaConfig = {
      ...this.defaultMediaConfig,
      ...config,
    };
    return this.defaultMediaConfig;
  }
}