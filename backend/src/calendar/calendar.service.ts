import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeSlot } from './schemas/time-slot.schema';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';

interface ErrorWithMessage {
  message: string;
  stack?: string;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectModel(TimeSlot.name) private timeSlotModel: Model<TimeSlot>,
  ) {}

  async getAvailabilityForMentor(mentorId: string): Promise<TimeSlot[]> {
    this.logger.debug(`Getting availability for mentor: ${mentorId}`);
    return this.timeSlotModel.find({ mentor: mentorId }).exec();
  }

  async createTimeSlot(mentorId: string, createTimeSlotDto: CreateTimeSlotDto): Promise<TimeSlot> {
    this.logger.debug(`Creating time slot for mentor: ${mentorId}`, createTimeSlotDto);
    const { startTime, endTime } = createTimeSlotDto;

    // Validate date format
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for time conflicts
    const conflictingSlot = await this.timeSlotModel.findOne({
      mentor: mentorId,
      $or: [
        {
          startTime: { $lt: end },
          endTime: { $gt: start }
        }
      ]
    });

    if (conflictingSlot) {
        throw new BadRequestException('Time slot conflicts with existing slot');
    }

    try {
      const timeSlot = new this.timeSlotModel({
        mentor: mentorId,
        startTime: start,
        endTime: end,
        isAvailable: true
      });

      const savedSlot = await timeSlot.save();
      this.logger.debug(`Created time slot: ${savedSlot._id}`);
      return savedSlot;
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Error creating time slot: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to create time slot');
    }
  }

  async deleteTimeSlot(mentorId: string, slotId: string): Promise<void> {
    this.logger.debug(`Deleting time slot ${slotId} for mentor: ${mentorId}`);
    try {
      const result = await this.timeSlotModel.deleteOne({
        _id: slotId,
        mentor: mentorId
      });

      if (result.deletedCount === 0) {
        throw new NotFoundException('Time slot not found');
      }
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Error deleting time slot: ${err.message}`, err.stack);
      throw error;
    }
  }
}
