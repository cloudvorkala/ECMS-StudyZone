// src/auth/auth.service.ts
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { User } from '../users/schemas/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { password, confirmPassword, ...userData } = registerDto;

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Create new user
    const user = await this.usersService.create({
      ...userData,
      password,
    });

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login time
    // Fix for TypeScript error - ensure _id is properly typed
    const userId =
      user._id instanceof Types.ObjectId
        ? user._id.toString()
        : String(user._id);

    await this.usersService.updateLastLogin(userId);

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmNewPassword } =
      changePasswordDto;

    // Check if new passwords match
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }

    // Change password
    const result = await this.usersService.changePassword(
      userId,
      currentPassword,
      newPassword,
    );

    if (!result) {
      throw new BadRequestException('Failed to change password');
    }

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Generate reset token
    const resetToken =
      await this.usersService.generatePasswordResetToken(email);

    // Don't reveal if user exists (security consideration)
    if (!resetToken) {
      return {
        message:
          'If your email is registered, you will receive a password reset link',
      };
    }

    // In a real application, you would send a reset email here
    // await this.emailService.sendPasswordResetEmail(email, resetToken);

    // Only return token in development environment for testing
    const isDevEnvironment =
      this.configService.get<string>('NODE_ENV') === 'development';

    return {
      message:
        'If your email is registered, you will receive a password reset link',
      ...(isDevEnvironment && { resetToken }),
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword, confirmNewPassword } = resetPasswordDto;

    // Check if passwords match
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Reset password
    const result = await this.usersService.resetPassword(token, newPassword);

    if (!result) {
      throw new BadRequestException('Failed to reset password');
    }

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Generate JWT token
   * @private
   */
  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(), // Convert ObjectId to string
      email: user.email,
      roles: user.roles,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);

    return {
      token: this.generateToken(user),
    };
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }
}
