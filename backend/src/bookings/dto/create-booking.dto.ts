import { IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  mentorId: string;

  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
