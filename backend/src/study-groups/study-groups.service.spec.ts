import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StudyGroupsService } from './study-groups.service';
import { StudyGroup } from './schemas/study-group.schema';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StudyGroupsService', () => {
  let service: StudyGroupsService;
  let model: Model<StudyGroup>;
  let usersService: UsersService;

  const mockStudyGroup = {
    _id: 'group1',
    name: 'Test Group',
    mentor: 'mentor1',
    students: ['student1', 'student2'],
    save: jest.fn(),
  };

  const mockUser = {
    _id: '681db162521b4972729b92ab',
    fullName: 'FirstTeststudent',
    email: 'stu0001@autuni.ac.nz',
    password: 'xxx',
    role: UserRole.STUDENT,
    phone: '1233123123',
    studentId: '11111111',
    expertise: [],
    institution: 'BCIS',
    rating: 0,
    createdAt: new Date(),
    degree: 'bachelor',
    interests: ['coding'],
    major: 'Software Dev',
    updatedAt: new Date(),
    year: '2',
  };
  const mockModel = {
    new: jest.fn().mockResolvedValue(mockStudyGroup),
    constructor: jest.fn().mockResolvedValue(mockStudyGroup),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudyGroupsService,
        {
          provide: getModelToken(StudyGroup.name),
          useValue: {
            ...mockModel,
            create: jest.fn().mockResolvedValue(mockStudyGroup),
          },
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<StudyGroupsService>(StudyGroupsService);
    model = module.get<Model<StudyGroup>>(getModelToken(StudyGroup.name));
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a study group successfully', async () => {
      const createDto = {
        name: 'Test Group',
        description: 'Test Description',
        studentIds: ['681db162521b4972729b92ab'],
      };

      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      mockUsersService.findById.mockResolvedValueOnce(mockUser);
      mockStudyGroup.save.mockResolvedValueOnce(mockStudyGroup);

      const result = await service.create('mentor1', createDto);
      expect(result).toEqual(mockStudyGroup);
    });

    it('should throw NotFoundException when student not found', async () => {
      const createDto = {
        name: 'Test Group',
        studentIds: ['nonexistent'],
      };

      mockUsersService.findById.mockImplementation(() => Promise.resolve(null));

      await expect(service.create('mentor1', createDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when user is not a student', async () => {
      const createDto = {
        name: 'Test Group',
        studentIds: ['mentor1'],
      };

      mockUsersService.findById.mockImplementation(() => Promise.resolve({
        _id: 'mentor1',
        role: UserRole.MENTOR,
      }));

      await expect(service.create('mentor1', createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findByMentor', () => {
    it('should return study groups for a mentor', async () => {
      const mockGroups = [mockStudyGroup];
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockGroups),
        }),
      });

      const result = await service.findByMentor('mentor1');
      expect(result).toEqual(mockGroups);
    });
  });

  describe('findByStudent', () => {
    it('should return study groups for a student', async () => {
      const mockGroups = [mockStudyGroup];
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValueOnce(mockGroups),
        }),
      });

      const result = await service.findByStudent('student1');
      expect(result).toEqual(mockGroups);
    });
  });

  describe('removeStudent', () => {
    it('should remove a student from a study group', async () => {
      mockModel.findById.mockResolvedValueOnce(mockStudyGroup);
      mockStudyGroup.save.mockResolvedValueOnce({
        ...mockStudyGroup,
        students: ['student2'],
      });

      const result = await service.removeStudent('group1', 'mentor1', 'student1');
      expect(result.students).not.toContain('student1');
    });

    it('should throw BadRequestException when mentor is not the group owner', async () => {
      mockModel.findById.mockResolvedValueOnce({
        ...mockStudyGroup,
        mentor: 'otherMentor',
      });

      await expect(service.removeStudent('group1', 'mentor1', 'student1'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a study group', async () => {
      mockModel.findById.mockResolvedValueOnce(mockStudyGroup);
      mockModel.findByIdAndDelete.mockResolvedValueOnce(mockStudyGroup);

      await service.delete('group1', 'mentor1');
      expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('group1');
    });

    it('should throw BadRequestException when mentor is not the group owner', async () => {
      mockModel.findById.mockResolvedValueOnce({
        ...mockStudyGroup,
        mentor: 'otherMentor',
      });

      await expect(service.delete('group1', 'mentor1'))
        .rejects.toThrow(BadRequestException);
    });
  });
});