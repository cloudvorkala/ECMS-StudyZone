// src/users/dto/user-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { UserRole } from '../schemas/user.schema';

export class UserResponseDto {
  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'The MongoDB id of the user',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'Username of the user',
  })
  @Expose()
  username: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address of the user',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  @Expose()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  @Expose()
  lastName?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'Profile picture URL',
  })
  @Expose()
  profilePicture?: string;

  @ApiProperty({
    enum: UserRole,
    description: 'Role of the user',
    example: 'USER',
  })
  @Expose()
  role: UserRole;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Date when the user was created',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Date when the user was last updated',
  })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    example: '2023-01-01T00:00:00.000Z',
    description: 'Date when the user last logged in',
  })
  @Expose()
  lastLoginAt?: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
