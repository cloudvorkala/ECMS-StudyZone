import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './schemas/booking.schema';
import { UserRole } from '../users/schemas/user.schema';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  const mockBookingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByStudent: jest.fn(),
    findByMentor: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
    reschedule: jest.fn(),
    cancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('rescheduleBooking', () => {
    it('should reschedule a booking successfully', async () => {
      const mockUser = { id: 'student123', role: UserRole.STUDENT };
      const bookingId = 'booking123';
      const newTimeSlot = {
        startTime: new Date('2024-03-20T10:00:00Z').toISOString(),
        endTime: new Date('2024-03-20T11:00:00Z').toISOString(),
      };

      const mockRescheduledBooking = {
        _id: bookingId,
        studentId: 'student123',
        mentorId: 'mentor123',
        status: 'rescheduled',
        startTime: newTimeSlot.startTime,
        endTime: newTimeSlot.endTime,
      };

      mockBookingsService.reschedule.mockResolvedValue(mockRescheduledBooking);

      const result = await controller.rescheduleBooking(
        { user: mockUser },
        bookingId,
        newTimeSlot
      );

      expect(result).toEqual(mockRescheduledBooking);
      expect(mockBookingsService.reschedule).toHaveBeenCalledWith(
        bookingId,
        'student123',
        newTimeSlot
      );
    });

    it('should handle errors when rescheduling booking', async () => {
      const mockUser = { id: 'student123', role: UserRole.STUDENT };
      const bookingId = 'booking123';
      const newTimeSlot = {
        startTime: new Date('2024-03-20T10:00:00Z').toISOString(),
        endTime: new Date('2024-03-20T11:00:00Z').toISOString(),
      };

      mockBookingsService.reschedule.mockRejectedValue(
        new Error('Time slot not available')
      );

      await expect(
        controller.rescheduleBooking({ user: mockUser }, bookingId, newTimeSlot)
      ).rejects.toThrow('Time slot not available');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel a booking successfully', async () => {
      const mockUser = { id: 'student123', role: UserRole.STUDENT };
      const bookingId = 'booking123';

      const mockCancelledBooking = {
        _id: bookingId,
        studentId: 'student123',
        mentorId: 'mentor123',
        status: 'cancelled',
      };

      mockBookingsService.cancel.mockResolvedValue(mockCancelledBooking);

      const result = await controller.cancelBooking({ user: mockUser }, bookingId);

      expect(result).toEqual(mockCancelledBooking);
      expect(mockBookingsService.cancel).toHaveBeenCalledWith(
        bookingId,
        'student123'
      );
    });

    it('should handle errors when cancelling booking', async () => {
      const mockUser = { id: 'student123', role: UserRole.STUDENT };
      const bookingId = 'booking123';

      mockBookingsService.cancel.mockRejectedValue(
        new Error('Booking cannot be cancelled')
      );

      await expect(
        controller.cancelBooking({ user: mockUser }, bookingId)
      ).rejects.toThrow('Booking cannot be cancelled');
    });
  });
});