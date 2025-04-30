import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AvailabilityService } from '../services/availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  create(@Body() body: any) {
    return this.availabilityService.createAvailability(body);
  }

  @Get(':mentorId')
  find(@Param('mentorId') mentorId: string) {
    return this.availabilityService.getAvailabilityByMentor(mentorId);
  }
}
