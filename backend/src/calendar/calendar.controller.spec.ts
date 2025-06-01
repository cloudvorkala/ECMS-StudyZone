import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { TimeSlot } from './schemas/time-slot.schema';

describe('CalendarController', () => {
  let controller: CalendarController;
  let service: CalendarService;

  const mockCalendarService = {
    getAvailabilityForMentor: jest.fn(),
    createTimeSlot: jest.fn(),
    deleteTimeSlot: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService,
        },
      ],
    }).compile();

    controller = module.get<CalendarController>(CalendarController);
    service = module.get<CalendarService>(CalendarService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAvailability', () => {
    it('should return mentor availability', async () => {
      const mockUser = { id: 'mentor123' };
      const mockTimeSlots = [
        {
          id: '1',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        },
      ];

      mockCalendarService.getAvailabilityForMentor.mockResolvedValue(mockTimeSlots);

      const result = await controller.getAvailability({ user: mockUser });

      expect(result).toEqual(mockTimeSlots);
      expect(mockCalendarService.getAvailabilityForMentor).toHaveBeenCalledWith('mentor123');
    });
  });

  describe('getMentorAvailability', () => {
    it('should return specific mentor availability for students', async () => {
      const mentorId = 'mentor123';
      const mockTimeSlots = [
        {
          id: '1',
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        },
      ];

      mockCalendarService.getAvailabilityForMentor.mockResolvedValue(mockTimeSlots);

      const result = await controller.getMentorAvailability(mentorId);

      expect(result).toEqual(mockTimeSlots);
      expect(mockCalendarService.getAvailabilityForMentor).toHaveBeenCalledWith(mentorId);
    });
  });

  describe('createTimeSlot', () => {
    it('should create a new time slot', async () => {
      const mockUser = { id: 'mentor123' };
      const createTimeSlotDto: CreateTimeSlotDto = {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };
      const mockCreatedSlot = {
        id: '1',
        ...createTimeSlotDto,
      };

      mockCalendarService.createTimeSlot.mockResolvedValue(mockCreatedSlot);

      const result = await controller.createTimeSlot({ user: mockUser }, createTimeSlotDto);

      expect(result).toEqual(mockCreatedSlot);
      expect(mockCalendarService.createTimeSlot).toHaveBeenCalledWith('mentor123', createTimeSlotDto);
    });

    it('should handle errors when creating time slot', async () => {
      const mockUser = { id: 'mentor123' };
      const createTimeSlotDto: CreateTimeSlotDto = {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      mockCalendarService.createTimeSlot.mockRejectedValue(new Error('Invalid time slot'));

      await expect(controller.createTimeSlot({ user: mockUser }, createTimeSlotDto))
        .rejects
        .toThrow('Invalid time slot');
    });
  });

  describe('deleteTimeSlot', () => {
    it('should delete a time slot', async () => {
      const mockUser = { id: 'mentor123' };
      const timeSlotId = '1';

      mockCalendarService.deleteTimeSlot.mockResolvedValue({ deleted: true });

      const result = await controller.deleteTimeSlot({ user: mockUser }, timeSlotId);

      expect(result).toEqual({ deleted: true });
      expect(mockCalendarService.deleteTimeSlot).toHaveBeenCalledWith('mentor123', timeSlotId);
    });

    it('should handle errors when deleting time slot', async () => {
      const mockUser = { id: 'mentor123' };
      const timeSlotId = '1';

      mockCalendarService.deleteTimeSlot.mockRejectedValue(new Error('Time slot not found'));

      await expect(controller.deleteTimeSlot({ user: mockUser }, timeSlotId))
        .rejects
        .toThrow('Time slot not found');
    });
  });
});