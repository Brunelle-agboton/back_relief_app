import { ForbiddenException } from '@nestjs/common';
import { AuthenticatedUser } from '../types/authenticated-request.interface';
import { UserRole } from '../enums/user-role.enum';

/**
 * Garde-fou anti-IDOR (SEC-07) : une ressource identifiée par un `:id` dans
 * l'URL ne peut être lue ou modifiée que par son propriétaire, ou par un
 * administrateur.
 */
export function assertSelfOrAdmin(
  user: AuthenticatedUser,
  targetUserId: number,
): void {
  if (user.role === UserRole.ADMIN) {
    return;
  }
  if (!Number.isInteger(targetUserId) || user.userId !== targetUserId) {
    throw new ForbiddenException('Accès limité à vos propres données');
  }
}

export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === UserRole.ADMIN;
}
