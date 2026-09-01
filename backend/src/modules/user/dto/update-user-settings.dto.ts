import { IsBoolean, IsOptional } from 'class-validator';
import { ToOptionalBoolean } from '../../../common/transforms/coerce';

/** SEC-05 : le corps de PATCH /user/:id/settings était jusqu'ici non typé. */
export class UpdateUserSettingsDto {
  @IsOptional()
  @ToOptionalBoolean()
  @IsBoolean()
  restReminder?: boolean;

  @IsOptional()
  @ToOptionalBoolean()
  @IsBoolean()
  drinkReminder?: boolean;
}
