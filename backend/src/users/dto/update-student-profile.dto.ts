import { IsString, IsOptional, IsArray, IsPhoneNumber } from 'class-validator';

export class UpdateStudentProfileDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  degree?: string;

  @IsString()
  @IsOptional()
  major?: string;

  @IsString()
  @IsOptional()
  year?: string;

  @IsString()
  @IsOptional()
  institution?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];
}