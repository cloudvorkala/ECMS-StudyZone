// src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';

import { 
  IsEmail, 
  IsNotEmpty, 
  IsString, 
  MinLength, 
  MaxLength, 
  Matches, 
  IsOptional 
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe', description: 'User username' })
  @IsNotEmpty({ message: 'Username is required' })
  @IsString({ message: 'Username must be a string' })
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username cannot exceed 30 characters' })
  readonly username: string;

  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  readonly email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  readonly password: string;

  @ApiProperty({ example: 'Password123!', description: 'Confirm password' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString({ message: 'Password confirmation must be a string' })
  readonly confirmPassword: string;

  @ApiProperty({ required: false, example: 'John', description: 'User first name' })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  readonly firstName?: string;

  @ApiProperty({ required: false, example: 'Doe', description: 'User last name' })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  readonly lastName?: string;
}

// src/auth/dto/login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  readonly email: string;

  @ApiProperty({ example: 'Password123!', description: 'User password' })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  readonly password: string;
}

// src/auth/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password' })
  @IsNotEmpty({ message: 'Current password is required' })
  @IsString({ message: 'Current password must be a string' })
  readonly currentPassword: string;

  @ApiProperty({ description: 'New password' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'New password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  readonly newPassword: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsNotEmpty({ message: 'Please confirm your new password' })
  @IsString({ message: 'Password confirmation must be a string' })
  readonly confirmNewPassword: string;
}

// src/auth/dto/forgot-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'john@example.com', description: 'User email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  readonly email: string;
}

// src/auth/dto/reset-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  readonly token: string;

  @ApiProperty({ description: 'New password' })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'New password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  readonly newPassword: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsNotEmpty({ message: 'Please confirm your new password' })
  @IsString({ message: 'Password confirmation must be a string' })
  readonly confirmNewPassword: string;
}

// src/auth/dto/index.ts
export * from './register.dto';
export * from './login.dto';
export * from './change-password.dto';
export * from './forgot-password.dto';
export * from './reset-password.dto';