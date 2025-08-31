import { IsDate, IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAvailabilityDto {
  @IsInt()
   @Type(() => Number)
  practitionerId: number;

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
