import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import {
  NormalizeEmail,
  ToOptionalBoolean,
  ToOptionalNumber,
} from '../../../common/transforms/coerce';

/**
 * Inscription d'un utilisateur patient.
 *
 * SEC-03 : `role` a été retiré volontairement. Le rôle est décidé par la route
 * (POST /user/register ⇒ UserRole.USER, POST /auth/register-practitioner ⇒
 * UserRole.PRACTITIONER) et ne peut plus être imposé par le client. Combiné au
 * ValidationPipe global en mode `whitelist`, un `role` envoyé dans le corps est
 * silencieusement supprimé avant d'atteindre le service.
 */
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  userName: string;

  @NormalizeEmail()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @ToOptionalNumber()
  @IsNumber()
  age?: number;

  @IsOptional()
  @ToOptionalNumber()
  @IsNumber()
  poids?: number;

  @IsOptional()
  @ToOptionalNumber()
  @IsNumber()
  taille?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  sexe?: string;

  @IsOptional()
  @ToOptionalNumber()
  @IsNumber()
  hourSit?: number;

  @IsOptional()
  @ToOptionalBoolean()
  @IsBoolean()
  isExercise?: boolean;

  @IsOptional()
  @ToOptionalNumber()
  @IsNumber()
  numberTraining?: number;

  @IsOptional()
  @ToOptionalBoolean()
  @IsBoolean()
  restReminder?: boolean;

  @IsOptional()
  @ToOptionalBoolean()
  @IsBoolean()
  drinkReminder?: boolean;
}
