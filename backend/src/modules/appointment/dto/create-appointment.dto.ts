import { IsDate, IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAppointmentDto {
  @IsInt()
     @Type(() => Number)
  patientId: number;

  @IsInt()
     @Type(() => Number)
  practitionerId: number;

  @Type(() => Date)
  @IsDate()
  start_at: Date;

  @Type(() => Date)
  @IsDate()
  end_at: Date;

  @IsString()
  @IsOptional()
  notes?: string;
}
