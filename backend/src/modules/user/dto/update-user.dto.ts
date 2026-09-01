import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * Mise à jour de profil.
 *
 * SEC-09 : `password` est exclu — le changement de mot de passe passe par
 * PATCH /user/me/password, qui exige le mot de passe courant et hache la
 * nouvelle valeur.
 * SEC-01/03 : `email` est exclu — un changement d'e-mail non vérifié permet une
 * prise de contrôle de compte ; `role` n'existe déjà plus dans CreateUserDto.
 */
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password', 'email'] as const),
) {}
