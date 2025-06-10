import { Controller, Get, Post, Body, Param, NotFoundException, ConflictException, UseGuards, Logger, Put, Request, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterMentorDto } from './dto/register-mentor.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { User, UserRole } from './schemas/user.schema';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register/mentor')
  async registerMentor(@Body() registerMentorDto: RegisterMentorDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerMentorDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const createUserDto: CreateUserDto = {
      fullName: registerMentorDto.fullName,
      email: registerMentorDto.email,
      password: registerMentorDto.password,
      role: UserRole.MENTOR,
      phone: registerMentorDto.phone,
      degree: registerMentorDto.degree,
      specialty: registerMentorDto.specialty,
      expertise: registerMentorDto.expertise,
      institution: registerMentorDto.institution,
    };

    return this.usersService.create(createUserDto);
  }

  @Public()
  @Post('register/student')
  async registerStudent(@Body() registerStudentDto: RegisterStudentDto): Promise<User> {
    const existingUser = await this.usersService.findByEmail(registerStudentDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const createUserDto: CreateUserDto = {
      fullName: registerStudentDto.fullName,
      email: registerStudentDto.email,
      password: registerStudentDto.password,
      role: UserRole.STUDENT,
      phone: registerStudentDto.phone,
      studentId: registerStudentDto.studentId,
    };

    return this.usersService.create(createUserDto);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get('mentors')
  @Roles('student')
  async getMentors() {
    this.logger.debug('Getting all mentors');
    return this.usersService.findMentors();
  }

  @Get('students')
  @Roles('mentor')
  async findAllStudents() {
    this.logger.debug('Getting all students');
    return this.usersService.findByRole(UserRole.STUDENT);
  }

  @Get('student/profile')
  @UseGuards(JwtAuthGuard)
  async getStudentProfile(@Request() req) {
    try {
      const user = await this.usersService.findById(req.user.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        degree: user.degree,
        major: user.major,
        year: user.year,
        institution: user.institution,
        interests: user.interests
      };
    } catch (error) {
      console.error('Error getting student profile:', error);
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        'Failed to get profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('mentor/profile')
  @UseGuards(JwtAuthGuard)
  async getMentorProfile(@Request() req) {
    try {
      const user = await this.usersService.findById(req.user.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        degree: user.degree,
        specialty: user.specialty,
        expertise: user.expertise,
        institution: user.institution,
        role: user.role
      };
    } catch (error) {
      console.error('Error getting mentor profile:', error);
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        'Failed to get profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put('mentor/profile')
  @Roles('mentor')
  async updateMentorProfile(@Request() req, @Body() updateData: Partial<User>) {
     // Pass user ID and update data to service layer
    this.logger.debug(`Updating mentor profile for user: ${req.user.id}`);
    return this.usersService.updateMentorProfile(req.user.id, updateData);
  }

  @Put('student/profile')
  @UseGuards(JwtAuthGuard)
  async updateStudentProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateStudentProfileDto
  ) {
    try {
      const updatedUser = await this.usersService.updateStudentProfile(req.user.id, updateProfileDto);
      return {
        message: 'Profile updated successfully',
        user: updatedUser
      };
    } catch (error) {
      console.error('Error updating student profile:', error);
      if (error instanceof Error) {
        throw new HttpException(
          error.message,
          HttpStatus.BAD_REQUEST
        );
      }
      throw new HttpException(
        'Failed to update profile',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}