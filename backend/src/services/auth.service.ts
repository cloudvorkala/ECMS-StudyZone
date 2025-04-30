// src/services/auth.service.ts
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Types } from 'mongoose';
import User, { IUserDocument } from '../models/user.model';
import { TokenData, RegisterUserDto, LoginUserDto, ResetPasswordDto } from '../dtos/auth.dto';
import config from '../config/env.config';

export class AuthService {
  /**
   * Register a new user
   */
  async register(userData: RegisterUserDto): Promise<{ user: IUserDocument; token: string }> {
    const { email, username, password } = userData;
    
    // Check if user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = new User({
      email,
      username,
      password
    });
    
    await newUser.save();
    
    // Generate JWT token
    const token = this.generateToken(newUser);
    
    return { user: newUser, token };
  }
  
  /**
   * Login a user with email and password
   */
  async login(loginData: LoginUserDto): Promise<{ user: IUserDocument; token: string }> {
    const { email, password } = loginData;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT token
    const token = this.generateToken(user);
    
    return { user, token };
  }
  
  /**
   * Generate password reset token and save to user
   */
  async generatePasswordResetToken(email: string): Promise<string | null> {
    const user = await User.findOne({ email });
    if (!user) {
      return null;
    }
    
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and save to user
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    // Set token data in user document
    await User.findByIdAndUpdate(user._id, {
      $set: {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 3600000) // 1 hour
      }
    });
    
    return resetToken;
  }
  
  /**
   * Reset password with token
   */
  async resetPassword(resetData: ResetPasswordDto): Promise<boolean> {
    const { token, newPassword } = resetData;
    
    // Hash the reset token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
      
    // Find user with this reset token and valid expiration
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    });
    
    if (!user) {
      throw new Error('Invalid or expired token');
    }
    
    // Set new password and clear reset data
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    return true;
  }
  
  /**
   * Generate JWT token for a user
   */
  generateToken(user: IUserDocument): string {
    const payload: TokenData = {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles
    };
    
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN
    });
  }
  
  /**
   * Verify JWT token and return user data
   */
  verifyToken(token: string): TokenData {
    try {
      return jwt.verify(token, config.JWT_SECRET) as TokenData;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
  
  /**
   * Get user by ID
   */
  async getUserById(id: string | Types.ObjectId): Promise<IUserDocument | null> {
    return User.findById(id);
  }
  
  /**
   * Refresh token
   */
  async refreshToken(token: string): Promise<{ token: string; user: IUserDocument } | null> {
    try {
      // Verify token with shorter expiration
      const decoded = jwt.verify(token, config.JWT_REFRESH_SECRET) as TokenData;
      
      // Get user
      const user = await this.getUserById(decoded.id);
      if (!user) {
        return null;
      }
      
      // Generate new token
      const newToken = this.generateToken(user);
      
      return { token: newToken, user };
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();