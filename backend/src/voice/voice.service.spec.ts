import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file from backend root
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import { VoiceService } from './voice.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { VoiceRoom } from './schemas/room.schema';

// define mock model
interface MockModel {
  (dto: any): any;
  find: jest.Mock;
  findByIdAndUpdate: jest.Mock;
}

describe('VoiceService', () => {
  let service: VoiceService;
  let configService: ConfigService;

  // mock find/exec/findByIdAndUpdate/new/save
  const mockRooms = [
    {
      name: 'Test Room 1',
      createdBy: 'test1@example.com',
      participants: 2,
      isActive: true,
    },
    {
      name: 'Test Room 2',
      createdBy: 'test2@example.com',
      participants: 1,
      isActive: true,
    },
  ];
  const mockRoom = {
    name: 'Test Room',
    createdBy: 'test@example.com',
    participants: 1,
    isActive: true,
    save: jest.fn().mockResolvedValue(this),
  };
  const mockVoiceRoomModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    save: jest.fn().mockResolvedValue(dto),
  })) as unknown as MockModel;

  Object.assign(mockVoiceRoomModel, {
    find: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockRooms),
    }),
    findByIdAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockRoom),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoiceService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => process.env[key]),
          },
        },
        {
          provide: getModelToken(VoiceRoom.name),
          useValue: mockVoiceRoomModel,
        },
      ],
    }).compile();

    service = module.get<VoiceService>(VoiceService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    it('should create a new room', async () => {
      const roomName = 'Test Room';
      const createdBy = 'test@example.com';
      const room = await service.createRoom(roomName, createdBy);
      expect(room).toBeDefined();
      expect(room.name).toBe(roomName);
      expect(room.createdBy).toBe(createdBy);
      expect(room.participants).toBe(0);
      expect(room.isActive).toBe(true);
    });
  });

  describe('getRooms', () => {
    it('should return all active rooms', async () => {
      const rooms = await service.getRooms();
      expect(rooms).toBeDefined();
      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBe(2);
      expect(mockVoiceRoomModel.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('generateToken', () => {
    it('should generate a token for a room', async () => {
      const roomId = 'test-room';
      const identity = 'test@example.com';
      const result = await service.generateToken(roomId, identity);
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });
  });

  describe('updateParticipantCount', () => {
    it('should increment participant count', async () => {
      const roomId = 'test-room';
      const room = await service.updateParticipantCount(roomId, true);
      expect(room).toBeDefined();
      expect(room?.participants).toBe(1);
      expect(mockVoiceRoomModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roomId,
        { $inc: { participants: 1 } },
        { new: true }
      );
    });

    it('should decrement participant count', async () => {
      const roomId = 'test-room';
      const room = await service.updateParticipantCount(roomId, false);
      expect(room).toBeDefined();
      expect(room?.participants).toBe(1); // mockRoom.participants = 1
      expect(mockVoiceRoomModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roomId,
        { $inc: { participants: -1 } },
        { new: true }
      );
    });
  });

  describe('joinRoom', () => {
    it('should join an existing room', async () => {
      const roomId = 'test-room';
      const participantEmail = 'participant@example.com';
      const mockUpdatedRoom = {
        ...mockRoom,
        participants: 2,
      };

      mockVoiceRoomModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedRoom),
      });

      const room = await service.joinRoom(roomId, participantEmail);
      expect(room).toBeDefined();
      expect(room?.participants).toBe(2);
      expect(mockVoiceRoomModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roomId,
        { $inc: { participants: 1 } },
        { new: true }
      );
    });

    it('should throw error when joining non-existent room', async () => {
      const roomId = 'non-existent-room';
      const participantEmail = 'participant@example.com';

      mockVoiceRoomModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.joinRoom(roomId, participantEmail)).rejects.toThrow('Room not found');
    });
  });

  describe('leaveRoom', () => {
    it('should leave an existing room', async () => {
      const roomId = 'test-room';
      const participantEmail = 'participant@example.com';
      const mockUpdatedRoom = {
        ...mockRoom,
        participants: 0,
      };

      mockVoiceRoomModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUpdatedRoom),
      });

      const room = await service.leaveRoom(roomId, participantEmail);
      expect(room).toBeDefined();
      expect(room?.participants).toBe(0);
      expect(mockVoiceRoomModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roomId,
        { $inc: { participants: -1 } },
        { new: true }
      );
    });

    it('should throw error when leaving non-existent room', async () => {
      const roomId = 'non-existent-room';
      const participantEmail = 'participant@example.com';

      mockVoiceRoomModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.leaveRoom(roomId, participantEmail)).rejects.toThrow('Room not found');
    });
  });
});