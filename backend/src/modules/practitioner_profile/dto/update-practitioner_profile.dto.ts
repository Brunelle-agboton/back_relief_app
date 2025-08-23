import { PartialType } from '@nestjs/mapped-types';
import { CreatePractitionerProfileDto } from './create-practitioner_profile.dto';

export class UpdatePractitionerProfileDto extends PartialType(CreatePractitionerProfileDto) {}
