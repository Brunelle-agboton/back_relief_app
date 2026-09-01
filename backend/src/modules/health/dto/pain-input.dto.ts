import { Expose, Transform } from 'class-transformer';
import {
  IsString,
  IsIn,
  IsInt,
  Min,
  Max,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { painLocations } from '../../../utils/painLocations';
import { ToOptionalNumber } from '../../../common/transforms/coerce';

/**
 * Saisie d'un relevé de douleur.
 *
 * SEC-05 : le champ `user` a été retiré du DTO. Il était renseigné par le
 * client puis écrasé par le contrôleur ; avec `whitelist: true` toute tentative
 * d'usurpation (`userId`, `user`) est désormais supprimée du corps avant
 * d'atteindre le service, qui reçoit l'utilisateur authentifié en second
 * argument.
 */
export class PainInputDto {
  @IsString()
  @IsIn(painLocations)
  painLocation: string;

  @ToOptionalNumber()
  @IsInt()
  @Min(1)
  @Max(10)
  painLevel: number;

  // Le client mobile déployé envoie `description` : on accepte les deux noms
  // plutôt que de perdre silencieusement la saisie de l'utilisateur.
  // @Expose() force class-transformer à évaluer la transformation même quand la
  // clé `painDescription` est absente du corps de requête.
  @Expose()
  @Transform(({ value, obj }) => value ?? obj?.description)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  painDescription?: string;
}
