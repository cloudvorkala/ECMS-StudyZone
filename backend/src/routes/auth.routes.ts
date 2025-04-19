// src/routes/auth.routes.ts
import { Router } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Register user
router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirmPassword').notEmpty().withMessage('Please confirm your password')
  ],
  authController.register.bind(authController)
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login.bind(authController)
);

// Change password (protected route)
router.post(
  '/change-password',
  authMiddleware,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    body('confirmNewPassword').notEmpty().withMessage('Please confirm your new password')
  ],
  authController.changePassword.bind(authController)
);

// Get current user profile (protected route)
router.get(
  '/profile',
  authMiddleware,
  authController.getProfile.bind(authController)
);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
  ],
  authController.forgotPassword.bind(authController)
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
    body('confirmNewPassword').notEmpty().withMessage('Please confirm your new password')
  ],
  authController.resetPassword.bind(authController)
);

// Refresh token
router.post(
  '/refresh-token',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required')
  ],
  authController.refreshToken.bind(authController)
);

// Logout user (protected route)
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

export default router;