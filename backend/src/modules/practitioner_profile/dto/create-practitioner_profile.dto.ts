import {
  IsString,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  IsObject,
} from 'class-validator';
import {
  ProfessionalType,
  EstablishmentType,
} from '../entities/practitioner_profile.entity';
import { ToJsonArray, ToJsonObject } from '../../../common/transforms/coerce';

export class CreatePractitionerProfileDto {
  @IsUUID()
  userId: string;

  @IsEnum(ProfessionalType)
  professionalType: ProfessionalType;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  // Le client transmet ces champs sérialisés en JSON (paramètres de
  // navigation expo-router) : on les normalise avant validation.
  @IsOptional()
  @ToJsonArray()
  @IsArray()
  @IsString({ each: true })
  proSpecialities?: string[];

  @IsEnum(EstablishmentType)
  establishmentType: EstablishmentType;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  postalCode: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @ToJsonObject()
  @IsObject()
  availabilities?: Record<string, string[]>;
}
