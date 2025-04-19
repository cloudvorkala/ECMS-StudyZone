// src/dtos/auth.dto.ts
import { UserRole } from '../models/user.model';

export interface TokenData {
  id: string;
  email: string;
  roles: UserRole[];
  iat?: number;
  exp?: number;
}

export interface RegisterUserDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}