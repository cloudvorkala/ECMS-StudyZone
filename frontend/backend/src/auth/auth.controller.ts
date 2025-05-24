import { Controller, Post, Body, UnauthorizedException, Get, UseGuards, Query, Request } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { Public } from './public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string; role: string }) {
    console.log('Login attempt:', { email: body.email, role: body.role });
    const user = await this.usersService.findByEmail(body.email);
    if (!user) {
      console.log('User not found');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Found user:', {
      email: user.email,
      role: user.role,
      requestedRole: body.role
    });

    if (user.role !== body.role) {
      console.log('Role mismatch:', {
        userRole: user.role,
        requestedRole: body.role
      });
      throw new UnauthorizedException('Invalid role for this account');
    }

    const isValid = await compare(body.password, user.password);
    if (!isValid) {
      console.log('Invalid password');
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('Login successful');
    const payload = { id: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        degree: user.degree,
        specialty: user.specialty,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('validate')
  async validateToken(@Request() req) {
    const userId = req.user.id;
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        degree: user.degree,
        specialty: user.specialty,
      },
    };
  }
}