import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgramLineDto {
  @IsInt()
  @Type(() => Number)
  programId: number;

  @IsInt()
  @Type(() => Number)
  exerciseId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  order: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  repetitions?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  duration?: number; // en secondes

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  calories?: number;
}
