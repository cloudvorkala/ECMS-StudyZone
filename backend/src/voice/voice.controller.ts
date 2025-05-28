import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VoiceService } from './voice.service';

interface CreateRoomDto {
  name: string;
}

@Controller('api/voice')
@UseGuards(JwtAuthGuard)
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Get('rooms')
  async getRooms() {
    return this.voiceService.getRooms();
  }

  @Post('rooms')
  async createRoom(@Body() body: CreateRoomDto, @Request() req) {
    return this.voiceService.createRoom(body.name, req.user.email);
  }

  @Get('token/:roomId')
  async getToken(@Param('roomId') roomId: string, @Request() req) {
    return this.voiceService.generateToken(roomId, req.user.email);
  }
}