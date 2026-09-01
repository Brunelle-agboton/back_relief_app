import { IsDateString, IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * SEC-07 : `userId` a été retiré. Le créneau est systématiquement rattaché au
 * profil praticien de l'appelant (POST /practitioner-profile/me/availability),
 * ce qui interdit la création de disponibilités pour un autre praticien.
 */
export class AddAvailabilityToPractitionerDto {
  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
