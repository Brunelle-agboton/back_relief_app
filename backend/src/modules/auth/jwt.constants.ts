import { UserRole } from '../../common/enums/user-role.enum';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export interface JwtPayload {
  /** Identifiant utilisateur. */
  sub: number;
  email: string;
  role: UserRole;
  /** Version de jeton : toute incrémentation côté utilisateur révoque les jetons émis avant. */
  tv: number;
  /** Distingue access et refresh : un refresh token ne peut pas servir d'access token. */
  typ: TokenType;
}

const isProduction = (): boolean => (process.env.MODE ?? '') !== 'DEV';

/**
 * SEC-08 : aucun secret de repli en dur. Une variable manquante doit faire
 * échouer bruyamment le démarrage plutôt que rendre tous les jetons forgeables.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('config error - missing env.JWT_SECRET');
  }
  return secret;
}

/**
 * Secret dédié aux refresh tokens. Obligatoire en production ; en dev on
 * retombe sur JWT_SECRET (le claim `typ` empêche de toute façon la confusion
 * entre les deux familles de jetons).
 */
export function getJwtRefreshSecret(): string {
  const dedicated = process.env.JWT_REFRESH_SECRET;
  if (dedicated) {
    return dedicated;
  }
  if (isProduction()) {
    throw new Error(
      'config error - missing env.JWT_REFRESH_SECRET (obligatoire en production)',
    );
  }
  return getJwtSecret();
}

export function getAccessTokenTtl(): string {
  return process.env.JWT_ACCESS_EXPIRES_IN || '1h';
}

export function getRefreshTokenTtl(): string {
  return process.env.JWT_REFRESH_EXPIRES_IN || '30d';
}
