import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  mentorId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
