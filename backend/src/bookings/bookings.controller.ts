import { Controller, Get, Post, Body, Param, Session, UnauthorizedException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './schemas/booking.schema';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Session() session: any, @Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    if (!session.user?.id) {
      throw new UnauthorizedException('You must be logged in to create a booking');
    }
    return this.bookingsService.create(session.user.id, createBookingDto);
  }

  @Get()
  async findAll(@Session() session: any): Promise<Booking[]> {
    if (!session.user?.id) {
      throw new UnauthorizedException('You must be logged in to view bookings');
    }
    return this.bookingsService.findAll();
  }

  @Get('student')
  async findByStudent(@Session() session: any): Promise<Booking[]> {
    if (!session.user?.id) {
      throw new UnauthorizedException('You must be logged in to view your bookings');
    }
    return this.bookingsService.findByStudent(session.user.id);
  }

  @Get('mentor')
  async findByMentor(@Session() session: any): Promise<Booking[]> {
    if (!session.user?.id) {
      throw new UnauthorizedException('You must be logged in to view your bookings');
    }
    return this.bookingsService.findByMentor(session.user.id);
  }

  @Get(':id')
  async findOne(@Session() session: any, @Param('id') id: string): Promise<Booking> {
    if (!session.user?.id) {
      throw new UnauthorizedException('You must be logged in to view bookings');
    }
    return this.bookingsService.findOne(id);
  }

  @Post(':id/status')
  async updateStatus(
    @Session() session: any,
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Booking> {
    if (!session.user?.id) {
      throw new UnauthorizedException('You must be logged in to update booking status');
    }
    return this.bookingsService.updateStatus(id, status);
  }
}
