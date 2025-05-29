import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { Category, Position } from '../entities/exercise.entity'
export class CreateExerciseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(Category)
  category: Category; // pour filtrer par “mur”, “assis”, …

  @IsNotEmpty()
  @IsEnum(Position)
  position?: Position; // “lombaires”, “épaules”, …

  @IsNotEmpty()
  @IsString()
  image?: string;

}
