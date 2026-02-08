import { IsEmail, IsString, MinLength, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  userName: string;
  
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(3)
  role: string;
  
  @IsOptional()
  @IsNumber()
  age?: number;

  @IsOptional()
  @IsNumber()
  poids?: number;

  @IsOptional()
  @IsNumber()
  taille?: number;               

  @IsOptional()
  @IsString()
  @MinLength(1)
  sexe?: string;

  @IsNumber()
  hourSit?: number;

  @IsOptional()
  @IsBoolean()
  isExercise?: boolean;

  @IsOptional()
  @IsNumber()
  numberTraining?: number;

  @IsOptional()
  @IsBoolean()
  restReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  drinkReminder?: boolean;
}