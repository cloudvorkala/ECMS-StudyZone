import { Controller, Post, Patch, Get, Body, Param } from '@nestjs/common';
import { BookingService } from '../services/booking.service';

@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() body: any) {
    return this.bookingService.createBooking(body);
  }

  @Patch(':bookingId/status')
  updateStatus(
    @Param('bookingId') bookingId: string,
    @Body('status') status: string,
  ) {
    return this.bookingService.updateBookingStatus(bookingId, status);
  }

  @Get('mentor/:mentorId')
  findMentorBookings(@Param('mentorId') mentorId: string) {
    return this.bookingService.getBookingsByMentor(mentorId);
  }
}
