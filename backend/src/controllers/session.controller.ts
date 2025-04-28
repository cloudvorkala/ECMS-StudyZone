import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { SessionService } from '../services/session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  create(@Body() body: any) {
    return this.sessionService.createSession(body);
  }

  @Get('mentor/:mentorId')
  findMentorSessions(@Param('mentorId') mentorId: string) {
    return this.sessionService.getSessionsByMentor(mentorId);
  }
}
