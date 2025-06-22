import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ActivityType } from '../entities/activity.entity';
import { User } from 'src/modules/user/entities/user.entity';

export class CreateActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @IsString()
  metadata?: string;
  user: User;

}
