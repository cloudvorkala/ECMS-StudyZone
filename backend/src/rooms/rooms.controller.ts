import { Controller, Post, Get, Body, UnauthorizedException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto, @CurrentUser() user: any) {
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Only admins can create rooms');
    }
    return this.roomsService.create(dto);
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.roomsService.findAll();
  }
}
