import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePractitionerProfileDto } from './create-practitioner_profile.dto';
import { CreatePractitionerDiplomeDto } from '../../practitioner_diplome/dto/create-practitioner_diplome.dto';
import { ToJsonArray } from '../../../common/transforms/coerce';

export class CompletePractitionerProfileDto extends PartialType(
  CreatePractitionerProfileDto,
) {
  @IsOptional()
  @ToJsonArray()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePractitionerDiplomeDto)
  diplomes?: CreatePractitionerDiplomeDto[];
}
