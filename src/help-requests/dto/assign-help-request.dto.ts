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