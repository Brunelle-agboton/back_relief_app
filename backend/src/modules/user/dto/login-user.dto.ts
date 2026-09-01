import { IsEmail, IsString } from 'class-validator';
import { NormalizeEmail } from '../../../common/transforms/coerce';

export class LoginUserDto {
  @NormalizeEmail()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
