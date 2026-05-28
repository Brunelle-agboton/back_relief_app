import { Type } from 'class-transformer';
import { IsString, IsEmail, MinLength, IsEnum, IsArray, IsObject, ValidateNested } from 'class-validator';
import { ProfessionalType, EstablishmentType } from '../../practitioner_profile/entities/practitioner_profile.entity';

class AppointmentSlotDto {
  @IsString()
  startTime: string;
}

export class RegisterPractitionerDto {
  @IsString()
  @MinLength(3)
  userName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(ProfessionalType)
  professionalType: ProfessionalType;

  @IsString()
  licenseNumber: string;

  @IsArray()
  @IsString({ each: true })
  proSpecialities: string[];

  @IsEnum(EstablishmentType)
  establishmentType: EstablishmentType;

  @IsString()
  phone: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;

  @IsObject()
  availabilities: Record<string, string[]>;

  @ValidateNested()
  @Type(() => AppointmentSlotDto)
  appointment: AppointmentSlotDto;
}
