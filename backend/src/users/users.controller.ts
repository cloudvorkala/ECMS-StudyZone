import { Controller, Get, Post, Body, Param, NotFoundException, ConflictException, UseGuards, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterMentorDto } from './dto/register-mentor.dto';
import { RegisterStudentDto } from './dto/register-student.dto';
import { User, UserRole } from './schemas/user.schema';
import { Public } from '../auth/public.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}