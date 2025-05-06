// src/mentors/mentors.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { MentorsService } from './mentors.service';
import {
  CreateMentorDto,
  UpdateMentorDto,
  MentorSearchDto,
  AvailabilityDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';

@ApiTags('mentors')
@Controller('mentors')
export class MentorsController {
  constructor(private readonly mentorsService: MentorsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a mentor profile for the current user' })
  @ApiResponse({
    status: 201,
    description: 'Mentor profile created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user already has a mentor profile',
  })
  async create(@CurrentUser() user, @Body() createMentorDto: CreateMentorDto) {
    return this.mentorsService.create(user.id, createMentorDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search for mentors' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of mentors matching the search criteria',
  })
  async search(@Query() searchDto: MentorSearchDto) {
    return this.mentorsService.search(searchDto);
  }

  @Get('expertise')
  @ApiOperation({ summary: 'Get list of expertise options' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of expertise options',
  })
  async getExpertiseOptions() {
    return {
      expertiseOptions: await this.mentorsService.getExpertiseOptions(),
    };
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated mentors' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of top rated mentors',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of mentors to return',
  })
  async getTopRated(@Query('limit') limit?: number) {
    return {
      mentors: await this.mentorsService.getTopRated(limit),
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get current user's mentor profile" })
  @ApiResponse({
    status: 200,
    description: 'Returns the mentor profile of the current user',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor profile not found',
  })
  async getOwnProfile(@CurrentUser() user) {
    return this.mentorsService.findByUserId(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update current user's mentor profile" })
  @ApiResponse({
    status: 200,
    description: 'Mentor profile updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor profile not found',
  })
  async updateOwnProfile(
    @CurrentUser() user,
    @Body() updateMentorDto: UpdateMentorDto,
  ) {
    const mentor = await this.mentorsService.findByUserId(user.id);
    return this.mentorsService.update(mentor._id.toString(), updateMentorDto);
  }

  @Delete('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete current user's mentor profile" })
  @ApiResponse({
    status: 200,
    description: 'Mentor profile deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor profile not found',
  })
  async deleteOwnProfile(@CurrentUser() user) {
    const mentor = await this.mentorsService.findByUserId(user.id);
    await this.mentorsService.remove(mentor._id.toString());
    return { message: 'Mentor profile deleted successfully' };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mentor profile by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the mentor profile with the specified ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor profile not found',
  })
  @ApiParam({ name: 'id', description: 'Mentor ID' })
  async findOne(@Param('id') id: string) {
    return this.mentorsService.findById(id);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get mentor availability' })
  @ApiResponse({
    status: 200,
    description: 'Returns the availability slots for the specified mentor',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor not found',
  })
  @ApiParam({ name: 'id', description: 'Mentor ID' })
  async getAvailability(@Param('id') id: string) {
    return {
      availability: await this.mentorsService.getAvailability(id),
    };
  }

  @Put('availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update current user's mentor availability" })
  @ApiResponse({
    status: 200,
    description: 'Mentor availability updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor profile not found',
  })
  async updateAvailability(
    @CurrentUser() user,
    @Body() availabilityDtos: AvailabilityDto[],
  ) {
    const mentor = await this.mentorsService.findByUserId(user.id);

    const availability = await this.mentorsService.updateAvailability(
      mentor._id.toString(),
      availabilityDtos,
    );

    return {
      message: 'Availability updated successfully',
      availability,
    };
  }

  // Admin routes
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update mentor profile (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Mentor profile updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor profile not found',
  })
  @ApiParam({ name: 'id', description: 'Mentor ID' })
  async update(
    @Param('id') id: string,
    @Body() updateMentorDto: UpdateMentorDto,
  ) {
    return this.mentorsService.update(id, updateMentorDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete mentor profile (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Mentor profile deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Mentor profile not found',
  })
  @ApiParam({ name: 'id', description: 'Mentor ID' })
  async remove(@Param('id') id: string) {
    await this.mentorsService.remove(id);
    return { message: 'Mentor profile deleted successfully' };
  }
}
