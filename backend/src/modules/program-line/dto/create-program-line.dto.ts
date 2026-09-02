import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgramLineDto {
  @IsUUID()
  programId: string;

  @IsUUID()
  exerciseId: string;

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
