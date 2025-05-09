import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterStudentDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  phone!: string;

  @IsNotEmpty()
  @IsString()
  studentId!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}