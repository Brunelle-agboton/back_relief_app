import { Type } from 'class-transformer';
import {
  IsString,
  IsEmail,
  MinLength,
  IsEnum,
  IsArray,
  IsObject,
  IsOptional,
  IsDefined,
  ValidateNested,
} from 'class-validator';
import {
  ProfessionalType,
  EstablishmentType,
} from '../../practitioner_profile/entities/practitioner_profile.entity';
import {
  NormalizeEmail,
  ToJsonArray,
  ToJsonObject,
} from '../../../common/transforms/coerce';

class AppointmentSlotDto {
  @IsString()
  startTime: string;
}

/**
 * SEC-03 : aucun champ `role` — la route impose UserRole.PRACTITIONER.
 * SEC-05 : les champs complétés plus tard dans le parcours (spécialités,
 * disponibilités) sont optionnels, sinon l'activation du ValidationPipe
 * rejetterait l'inscription praticien telle que l'envoie le client mobile.
 */
export class RegisterPractitionerDto {
  @IsString()
  @MinLength(3)
  userName: string;

  @NormalizeEmail()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(ProfessionalType)
  professionalType: ProfessionalType;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

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

  // Sans @IsDefined(), un corps sans `appointment` passait la validation et
  // provoquait une erreur 500 dans AuthService.registerPractitioner.
  @IsDefined()
  @ValidateNested()
  @Type(() => AppointmentSlotDto)
  appointment: AppointmentSlotDto;
}
