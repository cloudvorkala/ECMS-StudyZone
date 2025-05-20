import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../notifications/mail.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    private usersService: UsersService,
    private mailService: MailService,
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

    if ( status === 'cancelled' && booking.student?.email) {
      await this.mailService.sendBookingCancellation(booking.student.email, {
      mentorName: booking.mentor.fullName,
      time: booking.startTime.toLocaleString()
      });
    }
    return booking;
  }

  async generateConfirmationCode(id: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6digit code
  const booking = await this.bookingModel.findByIdAndUpdate(
    id,
    { confirmationCode: code },
    { new: true }
  ).populate('student');

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  if (booking.student?.email) {
    await this.mailService.sendConfirmationCode(booking.student.email, code);
  }

  return code;
}

async confirmWithCode(id: string, code: string): Promise<Booking> {
  const booking = await this.bookingModel.findById(id);

  if (!booking) {
    throw new NotFoundException('Booking not found');
  }

  if (booking.confirmationCode !== code) {
    throw new BadRequestException('Invalid confirmation code');
  }

  booking.status = 'confirmed';
  booking.confirmationCode = undefined; // Clear the confirmation code after confirming
  await booking.save();
  return booking;
}

async cancelBooking(id: string, cancelledBy: string): Promise<Booking> {
  const booking = await this.bookingModel.findById(id).populate('student mentor');

  if (!booking) throw new NotFoundException('Booking not found');
  if (booking.status === 'cancelled') throw new BadRequestException('Already cancelled');

  booking.status = 'cancelled';
  await booking.save();

  // Send notification
  await this.mailService.sendCancellationNotice(
    booking.student.email,
    booking.mentor.email,
    booking.startTime,
    cancelledBy
  );

  return booking;
}

}
