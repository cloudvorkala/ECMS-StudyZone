// src/help-requests/dto/update-help-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import {
  HelpRequestCategory,
  HelpRequestPriority,
  HelpRequestStatus,
} from '../schemas/help-request.schema';

export class UpdateHelpRequestDto {
  @ApiProperty({
    description: 'Updated title',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title?: string;

  @ApiProperty({
    description: 'Updated issue description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, {
    message: 'Issue description must not exceed 2000 characters',
  })
  issue?: string;

  @ApiProperty({
    description: 'Updated category',
    enum: HelpRequestCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(HelpRequestCategory)
  category?: HelpRequestCategory;

  @ApiProperty({
    description: 'Updated priority',
    enum: HelpRequestPriority,
    required: false,
  })
  @IsOptional()
  @IsEnum(HelpRequestPriority)
  priority?: HelpRequestPriority;

  @ApiProperty({
    description: 'Updated status',
    enum: HelpRequestStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(HelpRequestStatus)
  status?: HelpRequestStatus;
}
