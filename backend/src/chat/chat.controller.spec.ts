import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './schemas/chat-message.schema';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  const mockChatMessage: ChatMessage = {
    _id: 'message1',
    groupId: 'group1',
    senderId: 'user1',
    senderName: 'Test User',
    content: 'Hello',
    readBy: ['user1'],
  } as ChatMessage;

  const mockChatService = {
    getGroupMessages: jest.fn(),
    deleteMessage: jest.fn(),
    getUnreadCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGroupMessages', () => {
    it('should return messages for a group', async () => {
      mockChatService.getGroupMessages.mockResolvedValue([mockChatMessage]);

      const result = await controller.getGroupMessages('group1', 1, 50, { user: { id: 'user1' } });

      expect(result).toEqual([mockChatMessage]);
      expect(mockChatService.getGroupMessages).toHaveBeenCalledWith('group1', 1, 50);
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message', async () => {
      mockChatService.deleteMessage.mockResolvedValue(undefined);

      await controller.deleteMessage('message1', { user: { id: 'user1' } });

      expect(mockChatService.deleteMessage).toHaveBeenCalledWith('message1', 'user1');
    });

    it('should throw NotFoundException if message not found', async () => {
      mockChatService.deleteMessage.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteMessage('message1', { user: { id: 'user1' } }))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the sender', async () => {
      mockChatService.deleteMessage.mockRejectedValue(new ForbiddenException());

      await expect(controller.deleteMessage('message1', { user: { id: 'user1' } }))
        .rejects
        .toThrow(ForbiddenException);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count', async () => {
      mockChatService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount('group1', { user: { id: 'user1' } });

      expect(result).toBe(5);
      expect(mockChatService.getUnreadCount).toHaveBeenCalledWith('group1', 'user1');
    });
  });
});