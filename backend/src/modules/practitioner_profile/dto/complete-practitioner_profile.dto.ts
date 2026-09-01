import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CreatePractitionerProfileDto } from './create-practitioner_profile.dto';
import { CreatePractitionerDiplomeDto } from '../../practitioner_diplome/dto/create-practitioner_diplome.dto';
import { ToJsonArrayOf } from '../../../common/transforms/coerce';

export class CompletePractitionerProfileDto extends PartialType(
  CreatePractitionerProfileDto,
) {
  // ToJsonArrayOf remplace le couple @Transform + @Type : il parse le JSON
  // transmis par le client mobile ET instancie les éléments, sans quoi le mode
  // `whitelist` du ValidationPipe viderait chaque diplôme de ses propriétés.
  @IsOptional()
  @ToJsonArrayOf(CreatePractitionerDiplomeDto)
  @IsArray()
  @ValidateNested({ each: true })
  diplomes?: CreatePractitionerDiplomeDto[];
}
