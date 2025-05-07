import { Controller, Post, Get, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';


@Controller('rooms')
@UseGuards(JwtAuthGuard) // use JWT guard for all routes in this controller
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Post()
  create(@Body() dto: CreateRoomDto, @CurrentUser() user: any) {
    // Check if user is admin or has permission to create a room
    return this.service.create(dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(); // get all rooms
  }
}

