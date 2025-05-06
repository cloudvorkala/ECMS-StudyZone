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