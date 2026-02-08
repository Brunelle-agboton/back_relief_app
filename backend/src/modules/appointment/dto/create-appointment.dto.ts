import { IsInt, IsString, IsOptional, IsDateString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsInt()
  @Type(() => Number)
  patientId: number;

  @IsInt()
  @Type(() => Number)
  practitionerId: number;

  @IsDateString()
  startTime: string; // ISO 8601 date string

  @IsOptional()
  @IsString()
  note?: string;
}