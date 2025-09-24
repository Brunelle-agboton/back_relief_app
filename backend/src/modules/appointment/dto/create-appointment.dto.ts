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
  date: string; // YYYY-MM-DD

  @IsString()
  time: string; // HH:MM

  @IsOptional()
  @IsString()
  note?: string;
}