// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /**
   * 通过ID查找用户
   */
  async findById(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * 通过邮箱查找用户
   */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() });
  }

  /**
   * 创建新用户
   */
  async create(userData: Partial<User>): Promise<UserDocument> {
    // 检查邮箱是否被使用
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }

    // 创建新用户
    const newUser = new this.userModel(userData);
    return newUser.save();
  }

  /**
   * 更新用户信息
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    // 检查用户是否存在
    await this.findById(id);

    // 如果要更新邮箱，检查邮箱是否被其他用户使用
    if (updateUserDto.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser._id.toString() !== id) {
        throw new ConflictException('Email is already in use by another user');
      }
    }

    // 更新用户
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      updateUserDto,
      { new: true, runValidators: true },
    );

    return updatedUser;
  }

  /**
   * 删除用户
   */
  async remove(id: string): Promise<boolean> {
    // 检查用户是否存在
    await this.findById(id);

    // 删除用户
    const result = await this.userModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  /**
   * 添加角色给用户
   */
  async addRole(id: string, role: UserRole): Promise<UserDocument> {
    const user = await this.findById(id);

    // 如果用户已经有这个角色，则不需要操作
    if (user.roles.includes(role)) {
      return user;
    }

    // 添加角色
    user.roles.push(role);
    return user.save();
  }

  /**
   * 从用户中移除角色
   */
  async removeRole(id: string, role: UserRole): Promise<UserDocument> {
    const user = await this.findById(id);

    // 过滤掉要删除的角色
    user.roles = user.roles.filter((r) => r !== role);
    return user.save();
  }

  /**
   * 更新用户最后登录时间
   */
  async updateLastLogin(id: string): Promise<UserDocument> {
    const user = await this.findById(id);

    user.lastLogin = new Date();
    return user.save();
  }

  /**
   * 生成密码重置令牌
   */
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await this.findByEmail(email);

    if (!user) {
      return null;
    }

    // 生成随机令牌
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 保存加密的令牌和过期时间
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // 设置令牌过期时间为1小时后
    user.passwordResetExpires = new Date(Date.now() + 3600000);

    await user.save();

    return resetToken;
  }

  /**
   * 使用令牌重置密码
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // 加密令牌以进行比较
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 查找具有有效令牌的用户
    const user = await this.userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    // 更新密码并清除重置令牌
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return true;
  }

  /**
   * 更改密码
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.findById(userId);

    // 验证当前密码
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    return true;
  }

  /**
   * 获取所有用户
   */
  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ users: UserDocument[]; total: number; totalPages: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(),
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
