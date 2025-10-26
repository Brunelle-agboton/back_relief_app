import { IsString, IsIn, IsInt, Min, Max, IsDate } from 'class-validator';
import { User } from '../../user/entities/user.entity';
import { painLocations } from '../../../utils/painLocations';

export class PainInputDto {
  @IsString()
  @IsIn(painLocations)
  painLocation: string;

  @IsInt()
  @Min(1)
  @Max(10)
  painLevel: number;

  @IsString()
  painDescription: string;

  user: User;

  @IsDate()
  recordedAt: Date;
}