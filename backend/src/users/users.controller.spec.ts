import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from './schemas/user.schema';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    updateMentorProfile: jest.fn(),
    findById: jest.fn(),
    findMentors: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMentors', () => {
    it('should return list of mentors with their expertise', async () => {
      const mockMentors: Partial<User>[] = [
        {
          id: 'mentor1',
          fullName: 'John Doe',
          email: 'john@example.com',
          role: UserRole.MENTOR,
          degree: 'PhD',
          specialty: 'Computer Science',
          expertise: ['Web Development', 'Machine Learning'],
          institution: 'AUT University'
        },
        {
          id: 'mentor2',
          fullName: 'Jane Smith',
          email: 'jane@example.com',
          role: UserRole.MENTOR,
          degree: 'MSc',
          specialty: 'Data Science',
          expertise: ['Data Analysis', 'Python'],
          institution: 'AUT University'
        }
      ];

      mockUsersService.findMentors.mockResolvedValue(mockMentors);

      const result = await controller.getMentors();

      expect(result).toEqual(mockMentors);
      expect(mockUsersService.findMentors).toHaveBeenCalled();
      expect(result.length).toBe(2);
      expect(result[0].expertise).toContain('Web Development');
      expect(result[1].expertise).toContain('Data Analysis');
    });

    it('should return empty array when no mentors are available', async () => {
      mockUsersService.findMentors.mockResolvedValue([]);

      const result = await controller.getMentors();

      expect(result).toEqual([]);
      expect(mockUsersService.findMentors).toHaveBeenCalled();
      expect(result.length).toBe(0);
    });

    it('should handle errors when fetching mentors', async () => {
      mockUsersService.findMentors.mockRejectedValue(new Error('Database error'));

      await expect(controller.getMentors())
        .rejects
        .toThrow('Database error');
    });
  });

  describe('updateMentorProfile', () => {
    it('should update mentor profile successfully', async () => {
      const mockUser = { id: 'mentor123' };
      const updateData = {
        fullName: 'Updated Name',
        phone: '1234567890',
        degree: 'PhD',
        specialty: 'Computer Science',
        expertise: ['Web Development', 'Machine Learning'],
        institution: 'AUT University'
      };

      const mockUpdatedUser: Partial<User> = {
        id: 'mentor123',
        ...updateData,
        role: UserRole.MENTOR
      };

      mockUsersService.updateMentorProfile.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateMentorProfile({ user: mockUser }, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersService.updateMentorProfile).toHaveBeenCalledWith('mentor123', updateData);
    });

    it('should handle partial profile updates', async () => {
      const mockUser = { id: 'mentor123' };
      const updateData = {
        phone: '9876543210',
        expertise: ['Data Science']
      };

      const mockUpdatedUser: Partial<User> = {
        id: 'mentor123',
        fullName: 'Original Name',
        phone: '9876543210',
        expertise: ['Data Science'],
        role: UserRole.MENTOR
      };

      mockUsersService.updateMentorProfile.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateMentorProfile({ user: mockUser }, updateData);

      expect(result).toEqual(mockUpdatedUser);
      expect(mockUsersService.updateMentorProfile).toHaveBeenCalledWith('mentor123', updateData);
    });

    it('should handle errors when updating profile', async () => {
      const mockUser = { id: 'mentor123' };
      const updateData = {
        phone: 'invalid-phone'
      };

      mockUsersService.updateMentorProfile.mockRejectedValue(new Error('Invalid profile data'));

      await expect(controller.updateMentorProfile({ user: mockUser }, updateData))
        .rejects
        .toThrow('Invalid profile data');
    });
  });
});