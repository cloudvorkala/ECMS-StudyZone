// src/routes/mentor.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import mentorController from '../controllers/mentor.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Get list of expertise categories
router.get(
  '/expertise',
  mentorController.getExpertiseOptions.bind(mentorController)
);

// Search for mentors
router.get(
  '/search',
  mentorController.searchMentors.bind(mentorController)
);

// Get top rated mentors
router.get(
  '/top-rated',
  mentorController.getTopRated.bind(mentorController)
);

// Create mentor profile (must be authenticated)
router.post(
  '/',
  authMiddleware,
  [
    body('expertise').isArray().withMessage('Expertise must be an array'),
    body('hourlyRate').isNumeric().withMessage('Hourly rate must be a number'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('profileImageUrl').optional().isURL().withMessage('Profile image URL must be valid'),
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('experience').optional().isArray().withMessage('Experience must be an array'),
    body('languages').optional().isArray().withMessage('Languages must be an array')
  ],
  mentorController.createProfile.bind(mentorController)
);

// Get current user's mentor profile (must be authenticated)
router.get(
  '/my-profile',
  authMiddleware,
  mentorController.getMyProfile.bind(mentorController)
);

// Update mentor profile (must be authenticated and have mentor role)
router.put(
  '/',
  authMiddleware,
  roleMiddleware([UserRole.MENTOR]),
  [
    body('expertise').optional().isArray().withMessage('Expertise must be an array'),
    body('hourlyRate').optional().isNumeric().withMessage('Hourly rate must be a number'),
    body('bio').optional().isString().withMessage('Bio must be a string'),
    body('profileImageUrl').optional().isURL().withMessage('Profile image URL must be valid'),
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('experience').optional().isArray().withMessage('Experience must be an array'),
    body('languages').optional().isArray().withMessage('Languages must be an array')
  ],
  mentorController.updateProfile.bind(mentorController)
);

// Get mentor availability
router.get(
  '/:id/availability',
  mentorController.getAvailability.bind(mentorController)
);

// Update mentor availability (must be authenticated and have mentor role)
router.put(
  '/availability',
  authMiddleware,
  roleMiddleware([UserRole.MENTOR]),
  [
    body().isArray().withMessage('Request body must be an array of availability slots'),
    body('*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0 and 6'),
    body('*.startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in format HH:MM'),
    body('*.endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in format HH:MM'),
    body('*.isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
    body('*.specificDate').optional().isISO8601().withMessage('specificDate must be a valid date')
  ],
  mentorController.updateAvailability.bind(mentorController)
);

// Get mentor profile by ID
router.get(
  '/:id',
  mentorController.getProfile.bind(mentorController)
);

export default router;