import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateTimeSlotDto {
  @IsNotEmpty()
  @IsDateString()
  startTime!: string;

  @IsNotEmpty()
  @IsDateString()
  endTime!: string;
}