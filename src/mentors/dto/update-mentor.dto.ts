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
  IsInt,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class MentorSearchDto {
  @ApiProperty({
    description: 'Filter by expertise areas',
    required: false,
    example: ['Web Development', 'JavaScript'],
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
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxRate?: number;

  @ApiProperty({
    description: 'Text search term for name, bio, etc.',
    required: false,
    example: 'javascript expert',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiProperty({
    description: 'Minimum rating filter',
    required: false,
    example: 4.5,
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
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Results per page',
    required: false,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 10;
}
