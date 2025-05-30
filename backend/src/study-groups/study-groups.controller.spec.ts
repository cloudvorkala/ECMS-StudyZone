import { Test, TestingModule } from '@nestjs/testing';
import { StudyGroupsController } from './study-groups.controller';
import { StudyGroupsService } from './study-groups.service';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { UserRole } from '../users/schemas/user.schema';

describe('StudyGroupsController', () => {
  let controller: StudyGroupsController;
  let service: StudyGroupsService;

  const mockStudyGroup = {
    _id: 'group1',
    name: 'Test Group',
    description: 'Test Description',
    mentor: 'mentor1',
    students: ['student1', 'student2'],
  };

  const mockStudyGroupsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByMentor: jest.fn(),
    findByStudent: jest.fn(),
    findOne: jest.fn(),
    removeStudent: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudyGroupsController],
      providers: [
        {
          provide: StudyGroupsService,
          useValue: mockStudyGroupsService,
        },
      ],
    }).compile();

    controller = module.get<StudyGroupsController>(StudyGroupsController);
    service = module.get<StudyGroupsService>(StudyGroupsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a study group', async () => {
      const createDto: CreateStudyGroupDto = {
        name: 'Test Group',
        description: 'Test Description',
        studentIds: ['student1', 'student2'],
      };

      const mockRequest = {
        user: {
          id: 'mentor1',
          role: UserRole.MENTOR,
        },
      };

      mockStudyGroupsService.create.mockResolvedValue(mockStudyGroup);

      const result = await controller.create(mockRequest, createDto);
      expect(result).toEqual(mockStudyGroup);
      expect(service.create).toHaveBeenCalledWith(mockRequest.user.id, createDto);
    });
  });

  describe('findAll', () => {
    it('should return all study groups for mentor', async () => {
      const mockRequest = {
        user: {
          id: 'mentor1',
          role: UserRole.MENTOR,
        },
      };

      mockStudyGroupsService.findByMentor.mockResolvedValue([mockStudyGroup]);

      const result = await controller.findAll(mockRequest);
      expect(result).toEqual([mockStudyGroup]);
      expect(service.findByMentor).toHaveBeenCalledWith(mockRequest.user.id);
    });

    it('should return all study groups for student', async () => {
      const mockRequest = {
        user: {
          id: 'student1',
          role: UserRole.STUDENT,
        },
      };

      mockStudyGroupsService.findByStudent.mockResolvedValue([mockStudyGroup]);

      const result = await controller.findAll(mockRequest);
      expect(result).toEqual([mockStudyGroup]);
      expect(service.findByStudent).toHaveBeenCalledWith(mockRequest.user.id);
    });
  });

  describe('findOne', () => {
    it('should return a study group by id', async () => {
      mockStudyGroupsService.findOne.mockResolvedValue(mockStudyGroup);

      const result = await controller.findOne('group1');
      expect(result).toEqual(mockStudyGroup);
      expect(service.findOne).toHaveBeenCalledWith('group1');
    });
  });

  describe('removeStudent', () => {
    it('should remove a student from a study group', async () => {
      const mockRequest = {
        user: {
          id: 'mentor1',
          role: UserRole.MENTOR,
        },
      };

      mockStudyGroupsService.removeStudent.mockResolvedValue({
        ...mockStudyGroup,
        students: ['student2'],
      });

      await controller.removeStudent(mockRequest, 'group1', 'student1');
      expect(service.removeStudent).toHaveBeenCalledWith('group1', mockRequest.user.id, 'student1');
    });
  });

  describe('remove', () => {
    it('should delete a study group', async () => {
      const mockRequest = {
        user: {
          id: 'mentor1',
          role: UserRole.MENTOR,
        },
      };

      mockStudyGroupsService.delete.mockResolvedValue(undefined);

      await controller.remove(mockRequest, 'group1');
      expect(service.delete).toHaveBeenCalledWith('group1', mockRequest.user.id);
    });
  });
});