import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto, @CurrentUser() user: any) {
    return this.service.create(dto, user._id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAllByUser(user._id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOneIfOwnedByUser(id, user._id);
  }
}
