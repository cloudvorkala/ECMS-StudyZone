// src/help-requests/help-requests.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelpRequestsService } from './help-requests.service';
import { HelpRequestsController } from './help-requests.controller';
import { HelpRequest, HelpRequestSchema } from './schemas/help-request.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { MentorsModule } from '../mentors/mentors.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HelpRequest.name, schema: HelpRequestSchema },
    ]),
    NotificationsModule,
    UsersModule,
    MentorsModule,
  ],
  controllers: [HelpRequestsController],
  providers: [HelpRequestsService],
  exports: [HelpRequestsService],
})
export class HelpRequestsModule {} // src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(
    name: string,
    email: string,
    password: string,
    role: UserRole = 'student',
  ): Promise<User> {
    // 检查邮箱是否已被使用
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return newUser.save();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    // 检查电子邮件是否已被使用
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return user.save();
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    const user = await this.findById(id);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    return user.save();
  }

  async setEmailVerificationToken(id: string, token: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, { emailVerificationToken: token }, { new: true })
      .exec();
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.userModel
      .findOne({ emailVerificationToken: token })
      .exec();
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    return user.save();
  }

  async setResetPasswordToken(
    id: string,
    token: string,
    expires: Date,
  ): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(
        id,
        {
          resetPasswordToken: token,
          resetPasswordExpires: expires,
        },
        { new: true },
      )
      .exec();
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.userModel
      .findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
      })
      .exec();

    if (!user) {
      throw new NotFoundException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    return user.save();
  }

  async updateLastActive(id: string): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, { lastActive: new Date() }, { new: true })
      .exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}
