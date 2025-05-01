import { IsEmail, IsString, MinLength } from 'class-validator';

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

  @IsString()
  @MinLength(1)
  age: number;

  @IsString()
  @MinLength(1)
  poids: number;

  @IsString()
  @MinLength(1)
  taille: number;               

  @IsString()
  @MinLength(1)
  sexe: string;

  @IsString()
  @MinLength(1)
  hourSit: number;

  @IsString()
  @MinLength(1)
  isExercise: boolean;

  @IsString()
  @MinLength(1)
  numberTraining: number;

  @IsString()
  @MinLength(1)
  restReminder: boolean;
  
  @IsString()
  @MinLength(1)
  drinkReminder: boolean;
}