import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from './schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  constructor(@InjectModel(Booking.name) private bookingModel: Model<BookingDocument>) {}

  create(dto: CreateBookingDto, userId: string) {
    const bookingData = { ...dto, userId };
    return new this.bookingModel(bookingData).save();
  }

  findAll() {
    return this.bookingModel.find().exec();
  }

  findOne(id: string) {
    return this.bookingModel.findById(id).exec();
  }

  update(id: string, updateDto: UpdateBookingDto) {
    return this.bookingModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  remove(id: string) {
    return this.bookingModel.findByIdAndDelete(id).exec();
  }
  
  findByUserId(userId: string) {
    return this.bookingModel.find({ userId }).exec();
  }
  
  findOneIfOwnedByUser(id: string, userId: string) {
    return this.bookingModel.findOne({ _id: id, userId }).exec();
  }
  
}
