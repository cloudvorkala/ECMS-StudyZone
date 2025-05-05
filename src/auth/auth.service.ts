// src/auth/auth.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { 
  RegisterDto, 
  LoginDto, 
  ChangePasswordDto, 
  ForgotPasswordDto, 
  ResetPasswordDto 
} from './dto';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  /**
   * 注册新用户
   */
  async register(registerDto: RegisterDto) {
    const { password, confirmPassword, ...userData } = registerDto;
    
    // 检查两次密码是否匹配
    if (password !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    
    // 创建新用户
    const user = await this.usersService.create({
      ...userData,
      password,
    });
    
    // 生成JWT令牌
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

  /**
   * 用户登录
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    // 通过邮箱查找用户
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    
    // 更新最后登录时间
    await this.usersService.updateLastLogin(user._id.toString());
    
    // 生成JWT令牌
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

  /**
   * 修改密码
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmNewPassword } = changePasswordDto;
    
    // 检查两次密码是否匹配
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('New passwords do not match');
    }
    
    // 修改密码
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

  /**
   * 忘记密码 - 发送重置密码邮件
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    
    // 生成重置令牌
    const resetToken = await this.usersService.generatePasswordResetToken(email);
    
    // 即使找不到用户，也不透露这一信息（安全考虑）
    if (!resetToken) {
      return {
        message: 'If your email is registered, you will receive a password reset link',
      };
    }
    
    // 在实际应用中，这里应该发送重置密码邮件
    // await this.emailService.sendPasswordResetEmail(email, resetToken);
    
    // 只在开发环境返回令牌（方便测试）
    const isDevEnvironment = this.configService.get<string>('NODE_ENV') === 'development';
    
    return {
      message: 'If your email is registered, you will receive a password reset link',
      ...(isDevEnvironment && { resetToken }),
    };
  }

  /**
   * 重置密码
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword, confirmNewPassword } = resetPasswordDto;
    
    // 检查两次密码是否匹配
    if (newPassword !== confirmNewPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    
    // 重置密码
    const result = await this.usersService.resetPassword(token, newPassword);
    
    if (!result) {
      throw new BadRequestException('Failed to reset password');
    }
    
    return { message: 'Password has been reset successfully' };
  }

  /**
   * 生成JWT令牌
   * @private
   */
  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
    };
    
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.secret'),
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });
  }

  /**
   * 刷新令牌
   */
  async refreshToken(userId: string) {
    const user = await this.usersService.findById(userId);
    
    return {
      token: this.generateToken(user),
    };
  }
  
  /**
   * 获取用户个人资料
   */
  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }
}