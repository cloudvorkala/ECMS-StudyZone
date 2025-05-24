import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @IsOptional()
  @IsString()
  roomId?: string;
}
