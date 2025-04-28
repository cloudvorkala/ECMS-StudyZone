import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking } from '../models/booking.model';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
  ) {}

  createBooking(data: Partial<Booking>) {
    return this.bookingModel.create(data);
  }

  updateBookingStatus(bookingId: string, status: string) {
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true },
    );
  }

  getBookingsByMentor(mentorId: string) {
    return this.bookingModel.find({ mentorId }).populate('studentId', 'name');
  }
}
