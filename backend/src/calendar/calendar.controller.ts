import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Logger } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';

interface ErrorWithMessage {
  message: string;
  stack?: string;
}

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  private readonly logger = new Logger(CalendarController.name);

  constructor(private readonly calendarService: CalendarService) {}

  @Get('mentor')
  @Roles('mentor')
  async getAvailability(@Request() req) {
    this.logger.debug(`Getting availability for mentor: ${req.user.id}`);
    return this.calendarService.getAvailabilityForMentor(req.user.id);
  }

  @Post()
  @Roles('mentor')
  async createTimeSlot(@Request() req, @Body() createTimeSlotDto: CreateTimeSlotDto) {
    this.logger.debug(`Creating time slot for mentor: ${req.user.id}`, createTimeSlotDto);
    try {
      return await this.calendarService.createTimeSlot(req.user.id, createTimeSlotDto);
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Error creating time slot: ${err.message}`, err.stack);
      throw error;
    }
  }

  @Delete(':id')
  @Roles('mentor')
  async deleteTimeSlot(@Request() req, @Param('id') id: string) {
    this.logger.debug(`Deleting time slot ${id} for mentor: ${req.user.id}`);
    try {
      return await this.calendarService.deleteTimeSlot(req.user.id, id);
    } catch (error: unknown) {
      const err = error as ErrorWithMessage;
      this.logger.error(`Error deleting time slot: ${err.message}`, err.stack);
      throw error;
    }
  }
}
