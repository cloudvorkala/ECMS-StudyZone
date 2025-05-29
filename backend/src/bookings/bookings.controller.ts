import { Controller, Get, Post, Body, Param, UseGuards, Request, Logger, NotFoundException } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Booking } from './schemas/booking.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

interface ErrorWithMessage {
  message: string;
  stack?: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingsController {
  private readonly logger = new Logger(BookingsController.name);

  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Roles('student')
  async create(@Request() req, @Body() createBookingDto: CreateBookingDto): Promise<Booking> {
    this.logger.debug(`Creating booking for student: ${req.user.id}`);
    try {
      const booking = await this.bookingsService.create(req.user.id, createBookingDto);
      this.logger.debug(`Booking created successfully: ${booking._id}`);
      return booking;
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Error creating booking: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Get()
  @Roles('admin')
  async findAll(): Promise<Booking[]> {
    this.logger.debug('Getting all bookings');
    return this.bookingsService.findAll();
  }

  @Get('student')
  @Roles('student')
  async findByStudent(@Request() req): Promise<Booking[]> {
    this.logger.debug(`Getting bookings for student: ${req.user.id}`);
    return this.bookingsService.findByStudent(req.user.id);
  }

  @Get('mentor')
  @Roles('mentor')
  async findByMentor(@Request() req): Promise<Booking[]> {
    this.logger.debug(`Getting bookings for mentor: ${req.user.id}`);
    return this.bookingsService.findByMentor(req.user.id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<Booking> {
    this.logger.debug(`Getting booking ${id} for user: ${req.user.id}`);
    return this.bookingsService.findOne(id);
  }

  @Post(':id/status')
  @Roles('mentor')
  async updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: string,
  ): Promise<Booking> {
    this.logger.debug(`Updating booking ${id} status to ${status} for mentor: ${req.user.id}`);
    return this.bookingsService.updateStatus(id, status);
  }

  @Get('mentor/stats')
  @Roles(UserRole.MENTOR)
  async getMentorStats(@Request() req) {
    const mentorId = req.user.id;
    const bookings = await this.bookingsService.findByMentor(mentorId);

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      completedSessions: bookings.filter(b => b.status === 'completed').length,
      averageRating: req.user.rating || 0
    };

    return stats;
  }

  @Get('mentor/recent')
  @Roles(UserRole.MENTOR)
  async getRecentBookings(@Request() req) {
    const mentorId = req.user.id;
    const bookings = await this.bookingsService.findByMentor(mentorId);

    // Filter out cancelled bookings and sort by start time
    const recentBookings = bookings
      .filter(booking => booking.status !== 'cancelled')
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);

    // Ensure student information is populated
    return recentBookings.map(booking => ({
      ...booking,
      student: booking.student || { fullName: 'Unknown Student', email: 'No email provided' }
    }));
  }

  @Post(':id/reschedule')
  @Roles('student')
  async rescheduleBooking(
    @Request() req,
    @Param('id') id: string,
    @Body() newTimeSlot: { startTime: string; endTime: string },
  ): Promise<Booking> {
    this.logger.debug(`Rescheduling booking ${id} for student: ${req.user.id}`);
    try {
      return await this.bookingsService.reschedule(id, req.user.id, newTimeSlot);
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Error rescheduling booking: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Post(':id/cancel')
  @Roles('student')
  async cancelBooking(
    @Request() req,
    @Param('id') id: string,
  ): Promise<Booking> {
    this.logger.debug(`Cancelling booking ${id} for student: ${req.user.id}`);
    try {
      return await this.bookingsService.cancel(id, req.user.id);
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Error cancelling booking: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Get('mentor/:mentorId/all')
  async getMentorBookings(@Param('mentorId') mentorId: string): Promise<Booking[]> {
    this.logger.debug(`Getting all bookings for mentor: ${mentorId}`);
    return this.bookingsService.findByMentor(mentorId);
  }
}
