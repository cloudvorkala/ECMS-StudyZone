// src/mentors/mentors.service.ts
import { 
    Injectable, 
    NotFoundException, 
    ConflictException, 
    BadRequestException 
  } from '@nestjs/common';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, Types } from 'mongoose';
  import { Mentor, MentorDocument } from './schemas/mentor.schema';
  import { Availability, AvailabilityDocument } from './schemas/availability.schema';
  import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
  import { UsersService } from '../users/users.service';
  import { 
    CreateMentorDto, 
    UpdateMentorDto, 
    MentorSearchDto, 
    AvailabilityDto 
  } from './dto';
  
  @Injectable()
  export class MentorsService {
    constructor(
      @InjectModel(Mentor.name) private mentorModel: Model<MentorDocument>,
      @InjectModel(Availability.name) private availabilityModel: Model<AvailabilityDocument>,
      @InjectModel(User.name) private userModel: Model<UserDocument>,
      private usersService: UsersService,
    ) {}
  
    /**
     * 创建新的导师资料
     */
    async create(userId: string, createMentorDto: CreateMentorDto): Promise<MentorDocument> {
      // 验证用户ID
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      // 检查用户是否存在
      const user = await this.usersService.findById(userId);
      
      // 检查用户是否已经有导师资料
      const existingMentor = await this.mentorModel.findOne({ user: userId });
      if (existingMentor) {
        throw new ConflictException('User already has a mentor profile');
      }
      
      // 创建新的导师资料
      const newMentor = new this.mentorModel({
        user: userId,
        ...createMentorDto,
      });
      
      const savedMentor = await newMentor.save();
      
      // 为用户添加导师角色
      await this.usersService.addRole(userId, UserRole.MENTOR);
      
      return savedMentor;
    }
  
    /**
     * 根据ID查找导师
     */
    async findById(id: string): Promise<MentorDocument> {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid mentor ID');
      }
      
      const mentor = await this.mentorModel.findById(id).populate('user', 'username email firstName lastName profileImageUrl');
      
      if (!mentor) {
        throw new NotFoundException(`Mentor with ID ${id} not found`);
      }
      
      return mentor;
    }
  
    /**
     * 根据用户ID查找导师
     */
    async findByUserId(userId: string): Promise<MentorDocument> {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      const mentor = await this.mentorModel.findOne({ user: userId }).populate('user', 'username email firstName lastName profileImageUrl');
      
      if (!mentor) {
        throw new NotFoundException(`Mentor profile for user with ID ${userId} not found`);
      }
      
      return mentor;
    }
  
    /**
     * 更新导师资料
     */
    async update(id: string, updateMentorDto: UpdateMentorDto): Promise<MentorDocument> {
      const mentor = await this.findById(id);
      
      // 更新字段
      if (updateMentorDto.expertise !== undefined) mentor.expertise = updateMentorDto.expertise;
      if (updateMentorDto.hourlyRate !== undefined) mentor.hourlyRate = updateMentorDto.hourlyRate;
      if (updateMentorDto.bio !== undefined) mentor.bio = updateMentorDto.bio;
      if (updateMentorDto.profileImageUrl !== undefined) mentor.profileImageUrl = updateMentorDto.profileImageUrl;
      if (updateMentorDto.education !== undefined) mentor.education = updateMentorDto.education;
      if (updateMentorDto.experience !== undefined) mentor.experience = updateMentorDto.experience;
      if (updateMentorDto.languages !== undefined) mentor.languages = updateMentorDto.languages;
      if (updateMentorDto.timeZone !== undefined) mentor.timeZone = updateMentorDto.timeZone;
      
      return mentor.save();
    }
  
    /**
     * 删除导师资料
     */
    async remove(id: string): Promise<boolean> {
      const mentor = await this.findById(id);
      
      // 删除导师的所有可用性记录
      await this.availabilityModel.deleteMany({ mentor: id });
      
      // 从用户中删除导师角色
      await this.usersService.removeRole(mentor.user.toString(), UserRole.MENTOR);
      
      // 删除导师资料
      const result = await this.mentorModel.deleteOne({ _id: id });
      
      return result.deletedCount > 0;
    }
  
    /**
     * 搜索导师
     */
    async search(searchDto: MentorSearchDto): Promise<{
      mentors: MentorDocument[];
      total: number;
      totalPages: number;
      currentPage: number;
    }> {
      const { 
        expertise,
        maxRate,
        searchTerm,
        minRating,
        page = 1,
        limit = 10
      } = searchDto;
      
      // 构建查询
      const query: any = {};
      
      // 按专业领域筛选
      if (expertise && expertise.length > 0) {
        query.expertise = { $in: expertise };
      }
      
      // 按最高费率筛选
      if (maxRate !== undefined) {
        query.hourlyRate = { $lte: maxRate };
      }
      
      // 按最低评分筛选
      if (minRating !== undefined) {
        query.rating = { $gte: minRating * minRating };
      }
      
      // 文本搜索（搜索姓名、专业领域、简介等）
      if (searchTerm) {
        // MongoDB文本搜索需要文本索引
        // 这里使用简单的正则表达式作为替代
        const regex = new RegExp(searchTerm, 'i');
        query.$or = [
          { bio: regex },
          { expertise: regex }
        ];
      }
      
      // 计算分页
      const skip = (page - 1) * limit;
      
      // 执行查询
      const [mentors, total] = await Promise.all([
        this.mentorModel.find(query)
          .populate('user', 'username email firstName lastName profileImageUrl')
          .skip(skip)
          .limit(limit)
          .sort({ rating: -1 })
          .exec(),
        this.mentorModel.countDocuments(query)
      ]);
      
      return {
        mentors,
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      };
    }
  
    /**
     * 获取导师的可用时间
     */
    async getAvailability(mentorId: string): Promise<AvailabilityDocument[]> {
      await this.findById(mentorId);
      
      return this.availabilityModel.find({ mentor: mentorId }).sort({ dayOfWeek: 1, startTime: 1 });
    }
  
    /**
     * 更新导师的可用时间
     */
    async updateAvailability(mentorId: string, availabilityDtos: AvailabilityDto[]): Promise<AvailabilityDocument[]> {
      const mentor = await this.findById(mentorId);
      
      // 删除所有现有可用时间
      await this.availabilityModel.deleteMany({ mentor: mentorId });
      
      // 创建新的可用时间记录
      const availabilityPromises = availabilityDtos.map(dto => {
        const availability = new this.availabilityModel({
          mentor: mentorId,
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
          endTime: dto.endTime,
          isRecurring: dto.isRecurring !== undefined ? dto.isRecurring : true,
          specificDate: dto.specificDate
        });
        
        return availability.save();
      });
      
      return Promise.all(availabilityPromises);
    }
  
    /**
     * 获取专业领域列表
     */
    async getExpertiseOptions(): Promise<string[]> {
      // 在实际应用中，这可以从数据库中获取或使用更复杂的逻辑
      return [
        'Programming',
        'Web Development',
        'Mobile Development',
        'Data Science',
        'Machine Learning',
        'Cloud Computing',
        'DevOps',
        'UI/UX Design',
        'Digital Marketing',
        'Business Strategy',
        'Leadership',
        'Project Management'
      ];
    }
  
    /**
     * 获取评分最高的导师
     */
    async getTopRated(limit: number = 5): Promise<MentorDocument[]> {
      return this.mentorModel.find({ ratingCount: { $gt: 0 } })
        .populate('user', 'username email firstName lastName profileImageUrl')
        .sort({ rating: -1 })
        .limit(limit);
    }
  
    /**
     * 更新导师评分
     */
    async updateRating(mentorId: string, newRating: number): Promise<MentorDocument> {
      const mentor = await this.findById(mentorId);
      
      // 更新累计评分和评分次数
      mentor.rating = (mentor.rating * mentor.ratingCount + newRating) / (mentor.ratingCount + 1);
      mentor.ratingCount += 1;
      
      return mentor.save();
    }
  }