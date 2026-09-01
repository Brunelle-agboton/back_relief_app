import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ActivityType } from '../entities/activity.entity';
import { ToJsonString } from '../../../common/transforms/coerce';

/**
 * SEC-05 : `user` a été retiré du DTO — l'utilisateur est celui du jeton, pas
 * celui du corps de requête. `metadata` est sérialisé côté serveur : le client
 * mobile envoie un objet alors que la colonne est un varchar.
 */
export class CreateActivityDto {
  @IsEnum(ActivityType)
  type: ActivityType;

  @IsOptional()
  @ToJsonString()
  @IsString()
  @MaxLength(2000)
  metadata?: string;
}
