import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private usersService: UsersService,
  ) {}

  async create(studentId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const mentor = await this.usersService.findById(createBookingDto.mentorId);
    if (!mentor) {
      throw new NotFoundException('Mentor not found');
    }

    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping bookings
    const overlappingBooking = await this.bookingModel.findOne({
      mentor: createBookingDto.mentorId,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (overlappingBooking) {
      throw new BadRequestException('Time slot is already booked');
    }

    const createdBooking = new this.bookingModel({
      student: studentId,
      mentor: createBookingDto.mentorId,
      startTime,
      endTime,
      notes: createBookingDto.notes,
    });

    return createdBooking.save();
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingModel.find().populate('student mentor').exec();
  }

  async findByStudent(studentId: string): Promise<Booking[]> {
    return this.bookingModel.find({ student: studentId }).populate('mentor').exec();
  }

  async findByMentor(mentorId: string): Promise<Booking[]> {
    return this.bookingModel.find({ mentor: mentorId }).populate('student').exec();
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(id).populate('student mentor').exec();
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async updateStatus(id: string, status: string): Promise<Booking> {
    const booking = await this.bookingModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('student mentor').exec();

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async reschedule(
    bookingId: string,
    studentId: string,
    newTimeSlot: { startTime: string; endTime: string },
  ): Promise<Booking> {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.student.toString() !== studentId) {
      throw new ForbiddenException('You can only reschedule your own bookings');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Cannot reschedule a cancelled booking');
    }

    if (booking.status === 'completed') {
      throw new BadRequestException('Cannot reschedule a completed booking');
    }

    const startTime = new Date(newTimeSlot.startTime);
    const endTime = new Date(newTimeSlot.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping bookings
    const overlappingBooking = await this.bookingModel.findOne({
      _id: { $ne: bookingId },
      mentor: booking.mentor,
      status: { $ne: 'cancelled' },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (overlappingBooking) {
      throw new BadRequestException('Time slot is already booked');
    }

    const updatedBooking = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      {
        startTime,
        endTime,
        status: 'rescheduled'
      },
      { new: true }
    ).populate('student mentor').exec();

    if (!updatedBooking) {
      throw new NotFoundException('Booking not found after update');
    }

    return updatedBooking;
  }

  async cancel(bookingId: string, studentId: string): Promise<Booking> {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.student.toString() !== studentId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === 'cancelled') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed booking');
    }

    const cancelledBooking = await this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    ).populate('student mentor').exec();

    if (!cancelledBooking) {
      throw new NotFoundException('Booking not found after cancellation');
    }

    return cancelledBooking;
  }
}
