// src/mentors/dto/create-mentor.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsArray, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Min, 
  Max,
  MaxLength,
  IsUrl,
  ArrayMinSize,
  ArrayMaxSize
} from 'class-validator';

export class CreateMentorDto {
  @ApiProperty({ 
    description: 'Areas of expertise', 
    example: ['Web Development', 'React', 'Node.js'] 
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one expertise area is required' })
  @ArrayMaxSize(10, { message: 'Maximum of 10 expertise areas allowed' })
  expertise: string[];

  @ApiProperty({ 
    description: 'Hourly rate in USD', 
    example: 50 
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0, { message: 'Hourly rate cannot be negative' })
  hourlyRate: number;

  @ApiProperty({ 
    description: 'Professional biography', 
    required: false,
    example: 'Experienced developer with 5+ years in web development...' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Bio cannot exceed 1000 characters' })
  bio?: string;

  @ApiProperty({ 
    description: 'URL to profile image', 
    required: false,
    example: 'https://example.com/profile.jpg' 
  })
  @IsOptional()
  @IsUrl()
  profileImageUrl?: string;

  @ApiProperty({ 
    description: 'Education history', 
    required: false,
    example: ['BS Computer Science, Stanford University, 2015-2019'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  @ApiProperty({ 
    description: 'Professional experience', 
    required: false,
    example: ['Senior Developer at Tech Co., 2019-Present'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  experience?: string[];

  @ApiProperty({ 
    description: 'Languages spoken', 
    required: false,
    example: ['English', 'Spanish'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiProperty({ 
    description: 'Time zone', 
    required: false,
    example: 'America/New_York' 
  })
  @IsOptional()
  @IsString()
  timeZone?: string;
}

// src/mentors/dto/update-mentor.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateMentorDto } from './create-mentor.dto';

export class UpdateMentorDto extends PartialType(CreateMentorDto) {}

// src/mentors/dto/mentor-search.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsArray, 
  IsOptional, 
  IsString, 
  IsNumber, 
  Min, 
  Max,
  IsInt 
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MentorSearchDto {
  @ApiProperty({ 
    description: 'Filter by expertise areas', 
    required: false,
    example: ['Web Development', 'JavaScript'] 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // 将单个字符串转换为数组
    return typeof value === 'string' ? [value] : value;
  })
  expertise?: string[];

  @ApiProperty({ 
    description: 'Maximum hourly rate to filter by', 
    required: false,
    example: 100 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxRate?: number;

  @ApiProperty({ 
    description: 'Text search term for name, bio, etc.', 
    required: false,
    example: 'javascript expert' 
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({ 
    description: 'Minimum rating filter', 
    required: false,
    example: 4.5 
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  minRating?: number;

  @ApiProperty({ 
    description: 'Page number for pagination', 
    required: false,
    default: 1 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Results per page', 
    required: false,
    default: 10 
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}

// src/mentors/dto/availability.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { 
  IsInt, 
  IsString, 
  IsBoolean, 
  IsOptional, 
  IsDateString,
  Min,
  Max,
  Matches 
} from 'class-validator';

export class AvailabilityDto {
  @ApiProperty({ 
    description: 'Day of week (0-6, Sunday-Saturday)', 
    example: 1 
  })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ 
    description: 'Start time (HH:MM in 24h format)', 
    example: '09:00' 
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in format HH:MM',
  })
  startTime: string;

  @ApiProperty({ 
    description: 'End time (HH:MM in 24h format)', 
    example: '17:00' 
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in format HH:MM',
  })
  endTime: string;

  @ApiProperty({ 
    description: 'Whether this is a recurring availability', 
    required: false,
    default: true 
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = true;

  @ApiProperty({ 
    description: 'Specific date for non-recurring availability', 
    required: false,
    example: '2023-10-15' 
  })
  @IsOptional()
  @IsDateString()
  specificDate?: Date;
}

// Export all DTOs from index file
// src/mentors/dto/index.ts
export * from './create-mentor.dto';
export * from './update-mentor.dto';
export * from './mentor-search.dto';
export * from './availability.dto';