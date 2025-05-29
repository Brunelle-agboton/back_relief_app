import {
  IsString,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProgramLineDto } from '../../program-line/dto/create-program-line.dto';

export class CreateProgramDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  image: string; // chemin ou URL de la vignette

  @ValidateNested({ each: true })
  @Type(() => CreateProgramLineDto)
  @ArrayMinSize(1)
  lines: CreateProgramLineDto[];
}
