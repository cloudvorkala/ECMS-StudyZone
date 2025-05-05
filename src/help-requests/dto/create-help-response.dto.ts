// src/help-requests/dto/create-help-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

export class CreateHelpResponseDto {
  @ApiProperty({
    description: 'Response message',
    example:
      'Thank you for your report. Please try clearing your browser cache...',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  message: string;

  @ApiProperty({
    description: 'List of attachment URLs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  attachments?: string[];
}
