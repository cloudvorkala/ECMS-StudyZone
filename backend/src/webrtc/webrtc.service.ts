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
  private mediaConfig: MediaStreamConfig = {
    video: true,
    audio: true,
    screen: true,
  };

  constructor() {
    console.log('WebRTC Service initialized');
  }

  // start screen share
  startScreenShare(userId: string, groupId: string, mediaType: MediaType = 'screen'): ScreenShareSession {
    console.log('Starting screen share:', { userId, groupId, mediaType });

    // End any existing session for this user
    this.endScreenShareByUserId(userId);

    const session: ScreenShareSession = {
      id: uuidv4(),
      sharerId: userId,
      groupId,
      status: 'active',
      startTime: new Date(),
      viewers: [],
      mediaType,
      audioEnabled: true,
    };

    console.log('Created new session:', session);
    this.activeSessions.set(session.id, session);
    return session;
  }

  // end screen share
  endScreenShare(sessionId: string): ScreenShareSession | null {
    console.log('Ending screen share session:', sessionId);
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'ended';
      session.endTime = new Date();
      this.activeSessions.delete(sessionId);
      console.log('Session ended:', session);
    }
    return session || null;
  }

  endScreenShareByUserId(userId: string): ScreenShareSession | null {
    console.log('Ending screen share for user:', userId);
    const session = Array.from(this.activeSessions.values()).find(s => s.sharerId === userId);
    if (session) {
      return this.endScreenShare(session.id);
    }
    return null;
  }

  // add viewer
  addViewer(sessionId: string, userId: string): boolean {
    console.log('Adding viewer to session:', { sessionId, userId });
    const session = this.activeSessions.get(sessionId);
    if (session && session.status === 'active' && !session.viewers.includes(userId)) {
      session.viewers.push(userId);
      console.log('Viewer added:', { sessionId, userId, viewers: session.viewers });
      return true;
    }
    return false;
  }

  // remove viewer
  removeViewer(sessionId: string, userId: string): boolean {
    console.log('Removing viewer from session:', { sessionId, userId });
    const session = this.activeSessions.get(sessionId);
    if (session) {
      const index = session.viewers.indexOf(userId);
      if (index > -1) {
        session.viewers.splice(index, 1);
        console.log('Viewer removed:', { sessionId, userId, viewers: session.viewers });
        return true;
      }
    }
    return false;
  }

  // handle WebRTC signal
  handleSignal(signal: WebRTCSignal): void {
    console.log('Handling WebRTC signal:', signal);
    // The signal will be handled by the gateway
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
    return this.mediaConfig;
  }

  // update media stream configuration
  updateMediaConfig(config: Partial<MediaStreamConfig>): MediaStreamConfig {
    this.mediaConfig = { ...this.mediaConfig, ...config };
    return this.mediaConfig;
  }
}