// src/help-requests/dto/create-help-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsEnum, 
  IsMongoId, 
  MaxLength 
} from 'class-validator';
import { 
  HelpRequestCategory, 
  HelpRequestPriority, 
  HelpRequestRefModel 
} from '../schemas/help-request.schema';

export class CreateHelpRequestDto {
  @ApiProperty({ 
    description: 'Title of the help request', 
    example: 'Cannot book a session' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @ApiProperty({ 
    description: 'Detailed description of the issue',
    example: 'I am trying to book a session with a mentor but I get an error message...' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000, { message: 'Issue description must not exceed 2000 characters' })
  issue: string;

  @ApiProperty({ 
    description: 'Category of the help request',
    enum: HelpRequestCategory,
    default: HelpRequestCategory.OTHER,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestCategory)
  category?: HelpRequestCategory;

  @ApiProperty({ 
    description: 'Priority level of the help request',
    enum: HelpRequestPriority,
    default: HelpRequestPriority.MEDIUM,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestPriority)
  priority?: HelpRequestPriority;

  @ApiProperty({ 
    description: 'Related entity ID (e.g., booking ID)',
    required: false
  })
  @IsOptional()
  @IsMongoId()
  relatedTo?: string;

  @ApiProperty({ 
    description: 'Type of the related entity',
    enum: HelpRequestRefModel,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestRefModel)
  onModel?: HelpRequestRefModel;
}

// src/help-requests/dto/update-help-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  MaxLength 
} from 'class-validator';
import { 
  HelpRequestCategory, 
  HelpRequestPriority, 
  HelpRequestStatus 
} from '../schemas/help-request.schema';

export class UpdateHelpRequestDto {
  @ApiProperty({ 
    description: 'Updated title',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title?: string;

  @ApiProperty({ 
    description: 'Updated issue description',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Issue description must not exceed 2000 characters' })
  issue?: string;

  @ApiProperty({ 
    description: 'Updated category',
    enum: HelpRequestCategory,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestCategory)
  category?: HelpRequestCategory;

  @ApiProperty({ 
    description: 'Updated priority',
    enum: HelpRequestPriority,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestPriority)
  priority?: HelpRequestPriority;

  @ApiProperty({ 
    description: 'Updated status',
    enum: HelpRequestStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(HelpRequestStatus)
  status?: HelpRequestStatus;
}

// src/help-requests/dto/create-help-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsArray, 
  MaxLength 
} from 'class-validator';

export class CreateHelpResponseDto {
  @ApiProperty({ 
    description: 'Response message', 
    example: 'Thank you for your report. Please try clearing your browser cache...' 
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  message: string;

  @ApiProperty({ 
    description: 'List of attachment URLs',
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  attachments?: string[];
}

// src/help-requests/dto/assign-help-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class AssignHelpRequestDto {
  @ApiProperty({ 
    description: 'User ID to assign the help request to',
    example: '60d21b4667d0d8992e610c85'
  })
  @IsNotEmpty()
  @IsMongoId()
  assignToId: string;
}

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

// Export all DTOs from index file
// src/help-requests/dto/index.ts
export * from './create-help-request.dto';
export * from './update-help-request.dto';
export * from './create-help-response.dto';
export * from './assign-help-request.dto';
export * from './help-request-query.dto';