import { IsDate, IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { PractitionerProfile } from '../../practitioner_profile/entities/practitioner_profile.entity';

export class CreateAvailabilityDto {
  @IsInt()
   @Type(() => PractitionerProfile)
  practitionerProfile: PractitionerProfile;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsString()
  timezone: string;

  @IsBoolean()
  @IsOptional()
  is_recurring?: boolean;

  @IsString()
  @IsOptional()
  rrule?: string;

  @IsString()
  @IsOptional()
  note?: string;
}
