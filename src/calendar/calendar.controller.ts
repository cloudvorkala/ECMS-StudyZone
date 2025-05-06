import { Controller, Get, Param } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get(':mentorId')
  getAvailability(@Param('mentorId') mentorId: string) {
    return this.calendarService.getAvailabilityForMentor(mentorId);
  }
}
