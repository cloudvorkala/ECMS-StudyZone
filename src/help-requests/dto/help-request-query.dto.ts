// src/help-requests/dto/help-request-query.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsMongoId,
  IsInt,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';

export class HelpRequestQueryDto {
  @ApiProperty({
    description: 'Filter by status',
    enum: HelpRequestStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestStatus)
  status?: HelpRequestStatus;

  @ApiProperty({
    description: 'Filter by priority',
    enum: HelpRequestPriority,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestPriority)
  priority?: HelpRequestPriority;

  @ApiProperty({
    description: 'Filter by category',
    enum: HelpRequestCategory,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestCategory)
  category?: HelpRequestCategory;

  @ApiProperty({
    description: 'Filter by assigned user ID',
    required: false
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiProperty({
    description: 'Page number',
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page',
    minimum: 1,
    maximum: 50,
    default: 10,
    required: false
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
