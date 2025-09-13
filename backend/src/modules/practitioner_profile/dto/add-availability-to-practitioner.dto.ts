import { IsDateString, IsString, IsOptional, IsInt } from 'class-validator';

export class AddAvailabilityToPractitionerDto {

  @IsInt()
  userId: number;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  note?: string;
}