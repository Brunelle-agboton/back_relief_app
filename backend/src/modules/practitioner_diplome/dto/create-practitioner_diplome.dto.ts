import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ToOptionalNumber } from '../../../common/transforms/coerce';

export class CreatePractitionerDiplomeDto {
  @IsString()
  diplome: string;

  @IsString()
  school: string;

  @IsString()
  country: string;

  // Le formulaire mobile envoie tantôt `year`, tantôt `yearExperience`, et
  // toujours sous forme de chaîne.
  @IsOptional()
  @ToOptionalNumber()
  @IsInt()
  @Min(1900)
  @Max(2200)
  year?: number;

  @IsOptional()
  @ToOptionalNumber()
  @IsInt()
  yearExperience?: number;
}
