import { Test, TestingModule } from '@nestjs/testing';
import { WebRTCService } from './webrtc.service';
import { WebRTCGateway } from './webrtc.gateway';
import { JwtModule } from '@nestjs/jwt';

describe('WebRTCService', () => {
  let service: WebRTCService;
  let gateway: WebRTCGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [WebRTCService, WebRTCGateway],
    }).compile();

    service = module.get<WebRTCService>(WebRTCService);
    gateway = module.get<WebRTCGateway>(WebRTCGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startScreenShare', () => {
    it('should create a new screen share session', () => {
      const userId = 'test-user-1';
      const session = service.startScreenShare(userId);

      expect(session).toBeDefined();
      expect(session.sharerId).toBe(userId);
      expect(session.status).toBe('active');
      expect(session.viewers).toEqual([]);
      expect(session.mediaType).toBe('both');
      expect(session.audioEnabled).toBe(true);
    });

    it('should create a screen-only session', () => {
      const userId = 'test-user-1';
      const session = service.startScreenShare(userId, 'screen');

      expect(session.mediaType).toBe('screen');
      expect(session.audioEnabled).toBe(false);
    });
  });

  describe('endScreenShare', () => {
    it('should end an active session', () => {
      const userId = 'test-user-1';
      const session = service.startScreenShare(userId);
      const endedSession = service.endScreenShare(session.id);

      expect(endedSession).toBeDefined();
      expect(endedSession?.status).toBe('ended');
      expect(endedSession?.endTime).toBeDefined();
    });

    it('should return null for non-existent session', () => {
      const endedSession = service.endScreenShare('non-existent-id');
      expect(endedSession).toBeNull();
    });
  });

  describe('addViewer', () => {
    it('should add a viewer to an active session', () => {
      const userId = 'test-user-1';
      const viewerId = 'test-viewer-1';
      const session = service.startScreenShare(userId);
      const success = service.addViewer(session.id, viewerId);

      expect(success).toBe(true);
      expect(session.viewers).toContain(viewerId);
    });

    it('should not add viewer to ended session', () => {
      const userId = 'test-user-1';
      const viewerId = 'test-viewer-1';
      const session = service.startScreenShare(userId);
      service.endScreenShare(session.id);
      const success = service.addViewer(session.id, viewerId);

      expect(success).toBe(false);
    });
  });

  describe('removeViewer', () => {
    it('should remove a viewer from a session', () => {
      const userId = 'test-user-1';
      const viewerId = 'test-viewer-1';
      const session = service.startScreenShare(userId);
      service.addViewer(session.id, viewerId);
      const success = service.removeViewer(session.id, viewerId);

      expect(success).toBe(true);
      expect(session.viewers).not.toContain(viewerId);
    });
  });

  describe('getActiveSessions', () => {
    it('should return all active sessions', () => {
      const userId1 = 'test-user-1';
      const userId2 = 'test-user-2';
      service.startScreenShare(userId1);
      service.startScreenShare(userId2);

      const sessions = service.getActiveSessions();
      expect(sessions.length).toBe(2);
      expect(sessions.every(s => s.status === 'active')).toBe(true);
    });
  });

  describe('getMediaConfig', () => {
    it('should return default media configuration', () => {
      const config = service.getMediaConfig();
      expect(config).toBeDefined();
      expect(config.audio).toBeDefined();
      expect(config.video).toBeDefined();
    });
  });

  describe('updateMediaConfig', () => {
    it('should update media configuration', () => {
      const newConfig = {
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: false,
        },
      };

      const updatedConfig = service.updateMediaConfig(newConfig);
      expect(updatedConfig.audio).toEqual(newConfig.audio);
    });
  });
});