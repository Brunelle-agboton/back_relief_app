import { IsString, IsOptional, IsInt, Min, IsArray, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProfessionalType, EstablishmentType } from '../entities/practitioner_profile.entity';
import { AddAvailabilityToPractitionerDto } from './add-availability-to-practitioner.dto'
export class CreatePractitionerProfileDto {
    @IsInt()
    userId: number;

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
}