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
    message:
      'New password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character',
  })
  readonly newPassword: string;

  @ApiProperty({ description: 'Confirm new password' })
  @IsNotEmpty({ message: 'Please confirm your new password' })
  @IsString({ message: 'Password confirmation must be a string' })
  readonly confirmNewPassword: string;
}