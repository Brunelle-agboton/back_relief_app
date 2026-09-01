import { IsString, MinLength } from 'class-validator';

/** SEC-09 : changement de mot de passe authentifié, avec re-vérification. */
export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
