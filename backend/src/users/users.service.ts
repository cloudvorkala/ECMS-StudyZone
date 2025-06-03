import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UpdateStudentProfileDto } from './dto/update-student-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      expertise: createUserDto.expertise || [],
      institution: createUserDto.institution || '',
      rating: 0,
    });
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findMentors(): Promise<User[]> {
    return this.userModel.find({ role: 'mentor' }).exec();
  }

  async findByRole(role: UserRole) {
    return this.userModel.find({ role }).select('-password').exec();
  }

  // Update user document in MongoDB

  async updateMentorProfile(id: string, updateData: Partial<User>): Promise<User> {
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).exec();

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateStudentProfile(userId: string, updateData: UpdateStudentProfileDto) {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update user fields
      Object.assign(user, updateData);
      await user.save();

      return {
        id: user._id,
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
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Failed to update student profile');
    }
  }

  // create admin user
  async createAdminUser() {
    const adminEmail = 'admin@autuni.ac.nz';
    const adminPassword = 'test1234'; // hardcoded admin password

    // check if admin user already exists
    const existingAdmin = await this.findByEmail(adminEmail);
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }

    // create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = new this.userModel({
      fullName: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN,
      expertise: [],
      institution: 'StudyZone',
      rating: 0,
    });

    console.log('Admin user created successfully');
    return adminUser.save();
  }
}