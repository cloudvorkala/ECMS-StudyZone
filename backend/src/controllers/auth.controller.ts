// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth.service';
import { RegisterUserDto, LoginUserDto, ChangePasswordDto, ResetPasswordDto } from '../dtos/auth.dto';
import { errorHandler } from '../utils/errorHandler';

export class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   * @access Public
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const userData: RegisterUserDto = req.body;
      
      // Check password confirmation
      if (userData.password !== userData.confirmPassword) {
        res.status(400).json({ message: 'Passwords do not match' });
        return;
      }
      
      // Register user
      const { user, token } = await authService.register(userData);
      
      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   * @access Public
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const loginData: LoginUserDto = req.body;
      
      const { user, token } = await authService.login(loginData);
      
      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles
        }
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Change password
   * @route POST /api/auth/change-password
   * @access Private
   */
  async changePassword(req: Request, res: Response): Promise<void> {
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
      
      const passwordData: ChangePasswordDto = req.body;
      
      // Check if new passwords match
      if (passwordData.newPassword !== passwordData.confirmNewPassword) {
        res.status(400).json({ message: 'New passwords do not match' });
        return;
      }
      
      const user = await authService.getUserById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Check current password
      const isPasswordValid = await user.comparePassword(passwordData.currentPassword);
      if (!isPasswordValid) {
        res.status(401).json({ message: 'Current password is incorrect' });
        return;
      }
      
      // Update password
      user.password = passwordData.newPassword;
      await user.save();
      
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Get current user profile
   * @route GET /api/auth/profile
   * @access Private
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      
      const user = await authService.getUserById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.status(200).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Forgot password - send reset email
   * @route POST /api/auth/forgot-password
   * @access Public
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      // Generate password reset token
      const resetToken = await authService.generatePasswordResetToken(email);
      
      // Send reset email (would be implemented in a real app)
      // await emailService.sendPasswordResetEmail(email, resetToken);
      
      // For security, don't reveal whether the email exists
      res.status(200).json({ 
        message: 'If your email is registered, you will receive a password reset link',
        // In development, return the token for testing
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Reset password with token
   * @route POST /api/auth/reset-password
   * @access Public (with token)
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const resetData: ResetPasswordDto = req.body;
      
      // Check if passwords match
      if (resetData.newPassword !== resetData.confirmNewPassword) {
        res.status(400).json({ message: 'Passwords do not match' });
        return;
      }
      
      await authService.resetPassword(resetData);
      
      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Refresh token
   * @route POST /api/auth/refresh-token
   * @access Public (with refresh token)
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        res.status(400).json({ message: 'Refresh token is required' });
        return;
      }
      
      const result = await authService.refreshToken(refreshToken);
      
      if (!result) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
        return;
      }
      
      res.status(200).json({
        token: result.token,
        user: {
          id: result.user._id,
          username: result.user.username,
          email: result.user.email,
          roles: result.user.roles
        }
      });
    } catch (error) {
      errorHandler(error, res);
    }
  }

  /**
   * Logout user
   * @route POST /api/auth/logout
   * @access Private
   */
  async logout(_req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, you might blacklist the token or handle refresh tokens
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      errorHandler(error, res);
    }
  }
}

export default new AuthController();