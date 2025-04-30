// src/services/mentor.service.ts
import { Types } from 'mongoose';
import Mentor, { IMentorDocument } from '../models/mentor.model';
import User, { UserRole } from '../models/user.model';
import Availability from '../models/availability.model';
import { 
  CreateMentorDto, 
  UpdateMentorDto, 
  MentorSearchDto,
  AvailabilityDto
} from '../dtos/mentor.dto';

export class MentorService {
  /**
   * Create a new mentor profile
   */
  async createProfile(userId: string, mentorData: CreateMentorDto): Promise<IMentorDocument> {
    // Check if user already has a mentor profile
    const existingMentor = await Mentor.findOne({ user: userId });
    if (existingMentor) {
      throw new Error('User already has a mentor profile');
    }
    
    // Create mentor profile
    const mentor = new Mentor({
      user: userId,
      expertise: mentorData.expertise,
      hourlyRate: mentorData.hourlyRate,
      bio: mentorData.bio,
      profileImageUrl: mentorData.profileImageUrl,
      education: mentorData.education || [],
      experience: mentorData.experience || [],
      languages: mentorData.languages || []
    });
    
    await mentor.save();
    
    // Add mentor role to user
    await User.findByIdAndUpdate(userId, {
      $addToSet: { roles: UserRole.MENTOR }
    });
    
    return mentor;
  }
  
  /**
   * Get mentor profile by ID
   */
  async getProfileById(mentorId: string): Promise<IMentorDocument | null> {
    return Mentor.findById(mentorId).populate('user', 'username email');
  }
  
  /**
   * Get mentor profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<IMentorDocument | null> {
    return Mentor.findOne({ user: userId }).populate('user', 'username email');
  }
  
  /**
   * Update mentor profile
   */
  async updateProfile(userId: string, updateData: UpdateMentorDto): Promise<IMentorDocument | null> {
    const mentor = await Mentor.findOne({ user: userId });
    if (!mentor) {
      return null;
    }
    
    // Update fields if provided
    if (updateData.expertise !== undefined) mentor.expertise = updateData.expertise;
    if (updateData.hourlyRate !== undefined) mentor.hourlyRate = updateData.hourlyRate;
    if (updateData.bio !== undefined) mentor.bio = updateData.bio;
    if (updateData.profileImageUrl !== undefined) mentor.profileImageUrl = updateData.profileImageUrl;
    if (updateData.education !== undefined) mentor.education = updateData.education;
    if (updateData.experience !== undefined) mentor.experience = updateData.experience;
    if (updateData.languages !== undefined) mentor.languages = updateData.languages;
    if (updateData.timeZone !== undefined) mentor.timeZone = updateData.timeZone;
    
    await mentor.save();
    
    return mentor;
  }
  
  /**
   * Search for mentors with various filters
   */
  async searchMentors(searchDto: MentorSearchDto): Promise<{
    mentors: IMentorDocument[];
    totalPages: number;
    currentPage: number;
    total: number;
  }> {
    const { expertise, maxRate, searchTerm, page, limit } = searchDto;
    
    // Build query
    const query: any = {};
    
    if (expertise && expertise.length > 0) {
      query.expertise = { $in: expertise };
    }
    
    if (maxRate) {
      query.hourlyRate = { $lte: maxRate };
    }
    
    if (searchTerm) {
      // Search in bio and username of the related user
      query.$or = [
        { bio: { $regex: searchTerm, $options: 'i' } },
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const mentors = await Mentor.find(query)
      .populate('user', 'username email')
      .skip(skip)
      .limit(limit)
      .sort({ rating: -1 });
      
    const total = await Mentor.countDocuments(query);
    
    return {
      mentors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    };
  }
  
  /**
   * Get mentor availability
   */
  async getAvailability(mentorId: string): Promise<any[]> {
    return Availability.find({ mentor: mentorId });
  }
  
  /**
   * Update mentor availability
   */
  async updateAvailability(userId: string, availabilityData: AvailabilityDto[]): Promise<any[]> {
    // Get mentor profile
    const mentor = await Mentor.findOne({ user: userId });
    if (!mentor) {
      throw new Error('Mentor profile not found');
    }
    
    // Delete existing availability
    await Availability.deleteMany({ mentor: mentor._id });
    
    // Create new availability slots
    const availabilityPromises = availabilityData.map(slot => {
      const availability = new Availability({
        mentor: mentor._id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring,
        specificDate: slot.specificDate
      });
      
      return availability.save();
    });
    
    return Promise.all(availabilityPromises);
  }
  
  /**
   * Get top rated mentors
   */
  async getTopRatedMentors(limit: number): Promise<IMentorDocument[]> {
    return Mentor.find({ ratingCount: { $gt: 0 } })
      .populate('user', 'username email')
      .sort({ rating: -1 })
      .limit(limit);
  }
  
  /**
   * Get list of expertise categories
   */
  async getExpertiseOptions(): Promise<string[]> {
    // This could be stored in a separate collection or fetched dynamically
    // For now, we'll return a static list
    return [
      'Programming', 'Web Development', 'Mobile Development',
      'Data Science', 'Machine Learning', 'Cloud Computing',
      'DevOps', 'UI/UX Design', 'Product Management',
      'Digital Marketing', 'Business Strategy', 'Leadership'
    ];
  }
  
  /**
   * Update mentor rating
   */
  async updateRating(mentorId: string, rating: number): Promise<void> {
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      throw new Error('Mentor not found');
    }
    
    // Update the cumulative rating and count
    mentor.rating = (mentor.rating * mentor.ratingCount + rating) / (mentor.ratingCount + 1);
    mentor.ratingCount += 1;
    
    await mentor.save();
  }
}

export default new MentorService();