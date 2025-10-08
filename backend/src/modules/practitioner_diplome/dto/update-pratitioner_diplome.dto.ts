import { PartialType } from '@nestjs/mapped-types';
import { CreatePractitionerDiplomeDto } from './create-practitioner_diplome.dto';

export class UpdatePractitionerDiplomeDto extends PartialType(CreatePractitionerDiplomeDto) {}
