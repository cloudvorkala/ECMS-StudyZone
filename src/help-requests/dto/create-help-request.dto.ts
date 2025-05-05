// src/help-requests/dto/create-help-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsMongoId,
  MaxLength,
} from 'class-validator';
import {
  HelpRequestCategory,
  HelpRequestPriority,
  HelpRequestRefModel,
} from '../schemas/help-request.schema';

export class CreateHelpRequestDto {
  @ApiProperty({
    description: 'Title of the help request',
    example: 'Cannot book a session',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @ApiProperty({
    description: 'Detailed description of the issue',
    example:
      'I am trying to book a session with a mentor but I get an error message...',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000, {
    message: 'Issue description must not exceed 2000 characters',
  })
  issue: string;

  @ApiProperty({
    description: 'Category of the help request',
    enum: HelpRequestCategory,
    default: HelpRequestCategory.OTHER,
    required: false,
  })
  @IsOptional()
  @IsEnum(HelpRequestCategory)
  category?: HelpRequestCategory;

  @ApiProperty({
    description: 'Priority level of the help request',
    enum: HelpRequestPriority,
    default: HelpRequestPriority.MEDIUM,
    required: false,
  })
  @IsOptional()
  @IsEnum(HelpRequestPriority)
  priority?: HelpRequestPriority;

  @ApiProperty({
    description: 'Related entity ID (e.g., booking ID)',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  relatedTo?: string;

  @ApiProperty({
    description: 'Type of the related entity',
    enum: HelpRequestRefModel,
    required: false,
  })
  @IsOptional()
  @IsEnum(HelpRequestRefModel)
  onModel?: HelpRequestRefModel;
}
