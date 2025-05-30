import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreateStudyGroupDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  studentIds!: string[];
}