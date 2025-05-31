import { Test, TestingModule } from '@nestjs/testing';
import { WebRTCGateway } from './webrtc.gateway';
import { WebRTCService } from './webrtc.service';
import { JwtModule } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { WebRTCSignal } from './types/webrtc.types';

describe('WebRTCGateway', () => {
  let gateway: WebRTCGateway;
  let service: WebRTCService;

  const mockSocket = {
    id: 'test-socket-id',
    join: jest.fn(),
    leave: jest.fn(),
    handshake: {
      query: {},
      headers: {},
      auth: {},
    },
    data: {},
  } as unknown as Socket;

  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [WebRTCGateway, WebRTCService],
    }).compile();

    gateway = module.get<WebRTCGateway>(WebRTCGateway);
    service = module.get<WebRTCService>(WebRTCService);
    gateway.server = mockServer as any;
    service.server = mockServer as any;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await gateway.handleConnection(mockSocket);
      expect(consoleSpy).toHaveBeenCalledWith(`Client connected: ${mockSocket.id}`);
    });
  });

  describe('handleDisconnect', () => {
    it('should log client disconnection', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      await gateway.handleDisconnect(mockSocket);
      expect(consoleSpy).toHaveBeenCalledWith(`Client disconnected: ${mockSocket.id}`);
    });
  });

  describe('handleStartScreenShare', () => {
    it('should start a screen share session', async () => {
      const data = { userId: 'test-user-1', mediaType: 'both' as const };
      const result = await gateway.handleStartScreenShare(mockSocket, data);

      expect(result).toBeDefined();
      expect(result.sharerId).toBe(data.userId);
      expect(mockSocket.join).toHaveBeenCalledWith(result.id);
    });
  });

  describe('handleEndScreenShare', () => {
    it('should end a screen share session', async () => {
      const session = service.startScreenShare('test-user-1');
      const data = { sessionId: session.id };
      const result = await gateway.handleEndScreenShare(mockSocket, data);

      expect(result).toBeDefined();
      expect(result?.status).toBe('ended');
      expect(mockServer.to).toHaveBeenCalledWith(session.id);
      expect(mockServer.emit).toHaveBeenCalledWith('screen-share-ended', result);
    });
  });

  describe('handleJoinScreenShare', () => {
    it('should allow a user to join a screen share session', async () => {
      const session = service.startScreenShare('test-user-1');
      const data = { sessionId: session.id, userId: 'test-viewer-1' };
      const result = await gateway.handleJoinScreenShare(mockSocket, data);

      expect(result.success).toBe(true);
      expect(mockSocket.join).toHaveBeenCalledWith(session.id);
      expect(mockServer.to).toHaveBeenCalledWith(session.id);
      expect(mockServer.emit).toHaveBeenCalledWith('viewer-joined', {
        sessionId: session.id,
        viewerId: data.userId,
      });
    });
  });

  describe('handleLeaveScreenShare', () => {
    it('should allow a user to leave a screen share session', async () => {
      const session = service.startScreenShare('test-user-1');
      service.addViewer(session.id, 'test-viewer-1');
      const data = { sessionId: session.id, userId: 'test-viewer-1' };
      const result = await gateway.handleLeaveScreenShare(mockSocket, data);

      expect(result.success).toBe(true);
      expect(mockSocket.leave).toHaveBeenCalledWith(session.id);
      expect(mockServer.to).toHaveBeenCalledWith(session.id);
      expect(mockServer.emit).toHaveBeenCalledWith('viewer-left', {
        sessionId: session.id,
        viewerId: data.userId,
      });
    });
  });

  describe('handleWebRTCSignal', () => {
    it('should handle WebRTC signaling', async () => {
      const signal: WebRTCSignal = {
        type: 'offer',
        sdp: {
          type: 'offer',
          sdp: 'test-sdp',
        },
        targetUserId: 'test-user-2',
        senderId: 'test-user-1',
        mediaType: 'both',
      };
      const result = await gateway.handleWebRTCSignal(mockSocket, signal);

      expect(result.success).toBe(true);
    });
  });

  describe('handleGetActiveSessions', () => {
    it('should return active sessions', async () => {
      service.startScreenShare('test-user-1');
      service.startScreenShare('test-user-2');
      const result = await gateway.handleGetActiveSessions();

      expect(result.length).toBe(2);
      expect(result.every(s => s.status === 'active')).toBe(true);
    });
  });
});