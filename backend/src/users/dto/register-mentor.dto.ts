import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterMentorDto {
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
  degree!: string;

  @IsNotEmpty()
  @IsString()
  specialty!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}