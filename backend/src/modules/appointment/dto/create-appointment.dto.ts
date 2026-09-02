import {
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

/**
 * SEC-04/07 : `patientId` est optionnel et ignoré pour un patient — le
 * contrôleur impose l'identifiant de l'appelant. Seul un administrateur peut
 * prendre rendez-vous pour un tiers.
 */
export class CreateAppointmentDto {
  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsUUID()
  practitionerId: string;

  @IsDateString()
  startTime: string; // ISO 8601 date string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
