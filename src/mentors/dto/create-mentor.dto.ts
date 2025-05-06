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





