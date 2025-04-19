// src/controllers/mentor.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mentorService from '../services/mentor.service';
import { 
  CreateMentorDto, 
  UpdateMentorDto, 
  MentorSearchDto,
  AvailabilityDto
} from '../dtos/mentor.dto';
import { errorHandler } from '../utils/errorHandler';
import { UserRole } from '../models/user.model';

export class MentorController {
  /**
   * Create mentor profile
   * @route POST /api/mentors
   * @access Private
   */
  async createProfile(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const mentorData: CreateMentorDto = req.body;
      
      const mentor = await mentorService.createProfile(userId, mentorData);
      
      res.status(201).json({
        message: 'Mentor profile created successfully',
        mentor
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get mentor profile
   * @route GET /api/mentors/:id
   * @access Public
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const mentorId = req.params.id;
      
      const mentor = await mentorService.getProfileById(mentorId);
      
      if (!mentor) {
        res.status(404).json({ message: 'Mentor not found' });
        return;
      }
      
      res.status(200).json({ mentor });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get current user's mentor profile
   * @route GET /api/mentors/my-profile
   * @access Private
   */
  async getMyProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const mentor = await mentorService.getProfileByUserId(userId);
      
      if (!mentor) {
        res.status(404).json({ message: 'Mentor profile not found' });
        return;
      }
      
      res.status(200).json({ mentor });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Update mentor profile
   * @route PUT /api/mentors
   * @access Private
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const updateData: UpdateMentorDto = req.body;
      
      const updatedMentor = await mentorService.updateProfile(userId, updateData);
      
      if (!updatedMentor) {
        res.status(404).json({ message: 'Mentor profile not found' });
        return;
      }
      
      res.status(200).json({
        message: 'Mentor profile updated successfully',
        mentor: updatedMentor
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Search for mentors
   * @route GET /api/mentors/search
   * @access Public
   */
  async searchMentors(req: Request, res: Response): Promise<void> {
    try {
      // Convert query params to the correct types
      const searchDto: MentorSearchDto = {
        expertise: req.query.expertise as string[] || [],
        maxRate: req.query.maxRate ? parseFloat(req.query.maxRate as string) : undefined,
        searchTerm: req.query.searchTerm as string || '',
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };
      
      const { mentors, totalPages, currentPage, total } = await mentorService.searchMentors(searchDto);
      
      res.status(200).json({
        mentors,
        totalPages,
        currentPage,
        total
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get mentor availability
   * @route GET /api/mentors/:id/availability
   * @access Public
   */
  async getAvailability(req: Request, res: Response): Promise<void> {
    try {
      const mentorId = req.params.id;
      
      const availability = await mentorService.getAvailability(mentorId);
      
      res.status(200).json({ availability });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Update mentor availability
   * @route PUT /api/mentors/availability
   * @access Private
   */
  async updateAvailability(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      // Check if user has mentor role
      if (!req.user?.roles.includes(UserRole.MENTOR)) {
        res.status(403).json({ message: 'Permission denied. Mentor role required.' });
        return;
      }
      
      const availabilityData: AvailabilityDto[] = req.body;
      
      const availability = await mentorService.updateAvailability(userId, availabilityData);
      
      res.status(200).json({
        message: 'Availability updated successfully',
        availability
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get top rated mentors
   * @route GET /api/mentors/top-rated
   * @access Public
   */
  async getTopRated(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      const mentors = await mentorService.getTopRatedMentors(limit);
      
      res.status(200).json({ mentors });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get list of expertise categories
   * @route GET /api/mentors/expertise
   * @access Public
   */
  async getExpertiseOptions(_req: Request, res: Response): Promise<void> {
    try {
      const expertiseOptions = await mentorService.getExpertiseOptions();
      
      res.status(200).json({ expertiseOptions });
    } catch (error) {
      errorHandler(error, res);
    }
  }
}

export default new MentorController();