import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { StudyGroupsService } from '../study-groups/study-groups.service';
import { Socket } from 'socket.io';
import { ChatMessage } from './schemas/chat-message.schema';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;
  let studyGroupsService: StudyGroupsService;

  const mockSocket = {
    id: 'socket1',
    handshake: {
      auth: {
        userId: 'user1',
      },
    },
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    disconnect: jest.fn(),
  } as unknown as Socket;

  const mockChatMessage: ChatMessage = {
    _id: 'message1',
    groupId: 'group1',
    senderId: 'user1',
    senderName: 'Test User',
    content: 'Hello',
    readBy: ['user1'],
  } as ChatMessage;

  const mockChatService = {
    createMessage: jest.fn(),
    getGroupMessages: jest.fn(),
    markAllMessagesAsRead: jest.fn(),
  };

  const mockStudyGroupsService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
        {
          provide: StudyGroupsService,
          useValue: mockStudyGroupsService,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    studyGroupsService = module.get<StudyGroupsService>(StudyGroupsService);

    // Mock server property
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    // Mock socketUsers map
    gateway['socketUsers'] = new Map([[mockSocket.id, 'user1']]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleConnection', () => {
    it('should handle connection successfully', async () => {
      await gateway.handleConnection(mockSocket);

      expect(mockSocket.join).not.toHaveBeenCalled();
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect if no userId provided', async () => {
      const socketWithoutUser = {
        ...mockSocket,
        handshake: {
          auth: {},
        },
      } as unknown as Socket;

      await gateway.handleConnection(socketWithoutUser);

      expect(socketWithoutUser.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle disconnect successfully', () => {
      gateway.handleDisconnect(mockSocket);

      expect(mockSocket.leave).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinGroup', () => {
    it('should handle join group successfully', async () => {
      const group = {
        students: ['user1'],
        mentor: 'mentor1',
      };

      mockStudyGroupsService.findOne.mockResolvedValue(group);
      mockChatService.getGroupMessages.mockResolvedValue([mockChatMessage]);

      await gateway.handleJoinGroup(mockSocket, 'group1');

      expect(mockSocket.join).toHaveBeenCalledWith('group:group1');
      expect(mockChatService.getGroupMessages).toHaveBeenCalledWith('group1');
      expect(mockSocket.emit).toHaveBeenCalledWith('groupMessages', [mockChatMessage]);
      expect(mockChatService.markAllMessagesAsRead).toHaveBeenCalledWith('group1', 'user1');
    });

    it('should handle error if user is not in group', async () => {
      const group = {
        students: ['user2'],
        mentor: 'mentor1',
      };

      mockStudyGroupsService.findOne.mockResolvedValue(group);

      await gateway.handleJoinGroup(mockSocket, 'group1');

      expect(mockSocket.emit).toHaveBeenCalledWith('error', 'User is not a member of this group');
    });
  });

  describe('handleLeaveGroup', () => {
    it('should handle leave group successfully', () => {
      gateway.handleLeaveGroup(mockSocket, 'group1');

      expect(mockSocket.leave).toHaveBeenCalledWith('group:group1');
    });
  });

  describe('handleMessage', () => {
    it('should handle message successfully', async () => {
      mockChatService.createMessage.mockResolvedValue(mockChatMessage);

      await gateway.handleMessage(mockSocket, {
        groupId: 'group1',
        content: 'Hello',
      });

      expect(mockChatService.createMessage).toHaveBeenCalledWith(
        'group1',
        'user1',
        'Hello'
      );
      expect(gateway.server.to).toHaveBeenCalledWith('group:group1');
      expect(gateway.server.emit).toHaveBeenCalledWith('newMessage', mockChatMessage);
    });

    it('should handle error if user not authenticated', async () => {
      const socketWithoutUser = {
        ...mockSocket,
        handshake: {
          auth: {},
        },
      } as unknown as Socket;

      // Clear the socketUsers map
      gateway['socketUsers'].clear();

      await gateway.handleMessage(socketWithoutUser, {
        groupId: 'group1',
        content: 'Hello',
      });

      expect(socketWithoutUser.emit).toHaveBeenCalledWith('error', 'User not authenticated');
    });
  });

  describe('handleTyping', () => {
    it('should handle typing notification', () => {
      gateway.handleTyping(mockSocket, {
        groupId: 'group1',
        isTyping: true,
      });

      expect(mockSocket.to).toHaveBeenCalledWith('group:group1');
      expect(mockSocket.emit).toHaveBeenCalledWith('userTyping', {
        userId: 'user1',
        isTyping: true,
      });
    });
  });

  describe('handlePing', () => {
    it('should handle ping', () => {
      gateway.handlePing(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('pong');
    });
  });
});