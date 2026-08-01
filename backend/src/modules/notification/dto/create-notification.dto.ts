import { IsString, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNotificationDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  date: string;

  @IsInt()
  @Type(() => Number)
  userId: number;
}
