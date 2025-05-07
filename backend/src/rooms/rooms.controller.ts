import { Controller, Post, Get, Body, Session, UnauthorizedException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';


@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto, @CurrentUser() user: any) {
    // Check if user is admin or has permission to create a room
    return this.roomsService.create(dto);
  }

  @Get()
  async findAll(@Session() session: any) {
    if (!session.user?.id) {
      throw new UnauthorizedException('You must be logged in to view rooms');
    }
    return this.roomsService.findAll();
  }
}

