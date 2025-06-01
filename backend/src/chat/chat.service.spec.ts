import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatService } from './chat.service';
import { ChatMessage } from './schemas/chat-message.schema';
import { StudyGroupsService } from '../study-groups/study-groups.service';
import { UsersService } from '../users/users.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ChatService', () => {
  let service: ChatService;
  let model: Model<ChatMessage>;
  let studyGroupsService: StudyGroupsService;
  let usersService: UsersService;

  const mockChatMessage = {
    _id: 'message1',
    groupId: 'group1',
    senderId: 'user1',
    senderName: 'Test User',
    content: 'Hello',
    readBy: ['user1'],
    save: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockStudyGroupsService = {
    findOne: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getModelToken(ChatMessage.name),
          useValue: mockModel,
        },
        {
          provide: StudyGroupsService,
          useValue: mockStudyGroupsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    model = module.get<Model<ChatMessage>>(getModelToken(ChatMessage.name));
    studyGroupsService = module.get<StudyGroupsService>(StudyGroupsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      const group = {
        students: ['user1'],
        mentor: 'mentor1',
      };
      const user = {
        fullName: 'Test User',
      };

      mockStudyGroupsService.findOne.mockResolvedValue(group);
      mockUsersService.findById.mockResolvedValue(user);
      mockModel.create.mockResolvedValue(mockChatMessage);

      const result = await service.createMessage('group1', 'user1', 'Hello');

      expect(result).toEqual(mockChatMessage);
      expect(mockStudyGroupsService.findOne).toHaveBeenCalledWith('group1');
      expect(mockUsersService.findById).toHaveBeenCalledWith('user1');
      expect(mockModel.create).toHaveBeenCalledWith({
        groupId: 'group1',
        senderId: 'user1',
        senderName: 'Test User',
        content: 'Hello',
        readBy: ['user1'],
      });
    });

    it('should throw error if user is not in group', async () => {
      const group = {
        students: ['user2'],
        mentor: 'mentor1',
      };

      mockStudyGroupsService.findOne.mockResolvedValue(group);

      await expect(service.createMessage('group1', 'user1', 'Hello'))
        .rejects
        .toThrow('User is not a member of this group');
    });
  });

  describe('getGroupMessages', () => {
    it('should return messages for a group', async () => {
      const messages = [mockChatMessage];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(messages),
            }),
          }),
        }),
      });

      const result = await service.getGroupMessages('group1', 1, 50);

      expect(result).toEqual(messages);
      expect(mockModel.find).toHaveBeenCalledWith({ groupId: 'group1' });
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark a message as read', async () => {
      mockModel.findByIdAndUpdate.mockResolvedValue(mockChatMessage);

      await service.markMessageAsRead('message1', 'user1');

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'message1',
        { $addToSet: { readBy: 'user1' } }
      );
    });
  });

  describe('markAllMessagesAsRead', () => {
    it('should mark all messages as read', async () => {
      mockModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      await service.markAllMessagesAsRead('group1', 'user1');

      expect(mockModel.updateMany).toHaveBeenCalledWith(
        { groupId: 'group1', readBy: { $ne: 'user1' } },
        { $addToSet: { readBy: 'user1' } }
      );
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message if user is the sender', async () => {
      mockModel.findById.mockResolvedValue(mockChatMessage);

      await service.deleteMessage('message1', 'user1');

      expect(mockModel.findById).toHaveBeenCalledWith('message1');
      expect(mockChatMessage.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if message not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(service.deleteMessage('message1', 'user1'))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the sender', async () => {
      mockModel.findById.mockResolvedValue(mockChatMessage);

      await expect(service.deleteMessage('message1', 'user2'))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      mockModel.countDocuments.mockResolvedValue(5);

      const result = await service.getUnreadCount('group1', 'user1');

      expect(result).toBe(5);
      expect(mockModel.countDocuments).toHaveBeenCalledWith({
        groupId: 'group1',
        readBy: { $ne: 'user1' }
      });
    });
  });
});