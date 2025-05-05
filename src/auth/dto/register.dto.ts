// src/auth/dto/register.dto.ts
import { ApiProperty } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
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
    message:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  readonly password: string;

  @ApiProperty({ example: 'Password123!', description: 'Confirm password' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString({ message: 'Password confirmation must be a string' })
  readonly confirmPassword: string;

  @ApiProperty({
    required: false,
    example: 'John',
    description: 'User first name',
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  readonly firstName?: string;

  @ApiProperty({
    required: false,
    example: 'Doe',
    description: 'User last name',
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  readonly lastName?: string;
}
