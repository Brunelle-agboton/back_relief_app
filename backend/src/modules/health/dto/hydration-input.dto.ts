import { IsString, MaxLength } from 'class-validator';

/**
 * SEC-05 : POST /health/hydration recevait `@Body() size: string`, c'est-à-dire
 * l'objet complet, non validé, directement transmis à TypeORM.
 */
export class HydrationInputDto {
  @IsString()
  @MaxLength(50)
  size: string;
}
