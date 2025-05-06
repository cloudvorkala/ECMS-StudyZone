// src/users/dto/user-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../schemas/user.schema';

export class UserRoleDto {
  @ApiProperty({
    enum: UserRole,
    description: 'User role',
    example: 'ADMIN',
  })
  @IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Invalid role type' })
  role: UserRole;
}
