// src/help-requests/help-requests.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { HelpRequestsService } from './help-requests.service';
import { CreateHelpRequestDto } from './dto/create-help-request.dto';
import { UpdateHelpRequestDto } from './dto/update-help-request.dto';
import { CreateHelpResponseDto } from './dto/create-help-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('help-requests')
@UseGuards(JwtAuthGuard)
export class HelpRequestsController {
  constructor(private readonly helpRequestsService: HelpRequestsService) {}

  @Post()
  @Roles('student')
  create(
    @Body() createHelpRequestDto: CreateHelpRequestDto,
    @CurrentUser() user,
  ) {
    return this.helpRequestsService.create(user.id, createHelpRequestDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.helpRequestsService.findAll(query);
  }

  @Get('my-requests')
  findMyRequests(@CurrentUser() user) {
    if (user.role === 'student') {
      return this.helpRequestsService.findAllByStudent(user.id);
    } else if (user.role === 'mentor') {
      return this.helpRequestsService.findAllByMentor(user.id);
    }
    return [];
  }

  @Get('tags')
  findByTags(@Query('tags') tags: string[]) {
    return this.helpRequestsService.findByTags(tags);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.helpRequestsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHelpRequestDto: UpdateHelpRequestDto,
    @CurrentUser() user,
  ) {
    return this.helpRequestsService.update(id, user.id, updateHelpRequestDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user) {
    return this.helpRequestsService.remove(id, user.id);
  }

  @Post(':id/responses')
  @Roles('mentor')
  addResponse(
    @Param('id') id: string,
    @Body() createHelpResponseDto: CreateHelpResponseDto,
    @CurrentUser() user,
  ) {
    return this.helpRequestsService.addResponse(
      id,
      user.id,
      createHelpResponseDto,
    );
  }

  @Post(':id/accept-mentor/:mentorId')
  @Roles('student')
  acceptMentor(
    @Param('id') id: string,
    @Param('mentorId') mentorId: string,
    @CurrentUser() user,
  ) {
    return this.helpRequestsService.acceptMentor(id, user.id, mentorId);
  }

  @Post(':id/complete')
  completeRequest(@Param('id') id: string, @CurrentUser() user) {
    return this.helpRequestsService.completeRequest(id, user.id);
  }
}
