import {
  IsInt,
  IsString,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * SEC-04/07 : `patientId` est optionnel et ignoré pour un patient — le
 * contrôleur impose l'identifiant de l'appelant. Seul un administrateur peut
 * prendre rendez-vous pour un tiers.
 */
export class CreateAppointmentDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  patientId?: number;

  @IsInt()
  @Type(() => Number)
  practitionerId: number;

  @IsDateString()
  startTime: string; // ISO 8601 date string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;
}
