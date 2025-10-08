import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, IsInt, Min, IsArray } from 'class-validator';
import { CreatePractitionerProfileDto } from './create-practitioner_profile.dto';
import { CreatePractitionerDiplomeDto } from '../../practitioner_diplome/dto/create-practitioner_diplome.dto';

export class CompletePractitionerProfileDto extends PartialType(CreatePractitionerProfileDto) {
    @IsArray()
    diplomes: CreatePractitionerDiplomeDto[];
}
