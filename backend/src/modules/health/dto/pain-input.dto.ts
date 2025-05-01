import { IsString, IsIn, IsInt, Min, Max, IsDate } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';

export class PainInputDto {
  @IsString()
  @IsIn(['Haut du dos', 'Milieu du dos', 'Bas du dos'])
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