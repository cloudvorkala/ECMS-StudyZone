import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { StudyGroupsService } from './study-groups.service';
import { CreateStudyGroupDto } from './dto/create-study-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('study-groups')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudyGroupsController {
  private readonly logger = new Logger(StudyGroupsController.name);

  constructor(private readonly studyGroupsService: StudyGroupsService) {}

  @Post()
  @Roles('mentor')
  async create(@Request() req, @Body() createStudyGroupDto: CreateStudyGroupDto) {
    this.logger.debug(`Creating study group for mentor: ${req.user.id}`);
    return this.studyGroupsService.create(req.user.id, createStudyGroupDto);
  }

  @Get()
  @Roles('mentor', 'student')
  async findAll(@Request() req) {
    this.logger.debug(`Getting study groups for user: ${req.user.id}`);
    if (req.user.role === 'mentor') {
      return this.studyGroupsService.findByMentor(req.user.id);
    } else {
      return this.studyGroupsService.findByStudent(req.user.id);
    }
  }

  @Get('my-groups')
  @UseGuards(JwtAuthGuard)
  async getMyGroups(@Request() req) {
    this.logger.debug(`Getting my groups for user: ${req.user.id}`);
    return this.studyGroupsService.findByUserId(req.user.id);
  }

  @Get(':id')
  @Roles('mentor', 'student')
  async findOne(@Param('id') id: string) {
    return this.studyGroupsService.findOne(id);
  }

  @Post(':id/students')
  @Roles('mentor')
  async addStudent(
    @Request() req,
    @Param('id') id: string,
    @Body('studentId') studentId: string,
  ) {
    this.logger.debug(`Adding student ${studentId} to group ${id}`);
    this.logger.debug('Request user:', {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });

    try {
      if (!studentId) {
        this.logger.error('Student ID is missing');
        throw new BadRequestException('Student ID is required');
      }

      const result = await this.studyGroupsService.addStudent(id, req.user.id, studentId);
      this.logger.debug('Student added successfully:', result);
      return result;
    } catch (error: unknown) {
      this.logger.error(`Error adding student: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logger.error('Error details:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to add student to the group');
    }
  }

  @Delete(':id/students/:studentId')
  @Roles('mentor')
  async removeStudent(
    @Request() req,
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    this.logger.debug(`Removing student ${studentId} from group ${id}`);
    this.logger.debug('Request user:', {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });

    try {
      const result = await this.studyGroupsService.removeStudent(id, req.user.id, studentId);
      this.logger.debug('Student removed successfully:', result);
      return result;
    } catch (error: unknown) {
      this.logger.error(`Error removing student: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logger.error('Error details:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to remove student from the group');
    }
  }

  @Delete(':id')
  @Roles('mentor')
  async remove(@Request() req, @Param('id') id: string) {
    this.logger.debug(`Deleting study group ${id}`);
    this.logger.debug('Request user:', {
      id: req.user.id,
      role: req.user.role,
      email: req.user.email
    });

    try {
      await this.studyGroupsService.delete(id, req.user.id);
      this.logger.debug('Study group deleted successfully');
      return { message: 'Study group deleted successfully' };
    } catch (error: unknown) {
      this.logger.error(`Error deleting study group: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logger.error('Error details:', error);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(error instanceof Error ? error.message : 'Failed to delete the study group');
    }
  }
}