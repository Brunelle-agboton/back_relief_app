import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

/**
 * SEC-12 : identification correcte de l'appelant derrière un load balancer.
 *
 * Deux défauts sont corrigés :
 *
 *  1. sans `trust proxy` (positionné dans main.ts), Express voit l'adresse du
 *     load balancer : tous les utilisateurs partagent alors un unique quota ;
 *
 *  2. l'implémentation par défaut du ThrottlerGuard retourne `req.ips[0]`,
 *     c'est-à-dire l'adresse la plus à gauche de `X-Forwarded-For` — une valeur
 *     entièrement fournie par le client. Il suffit d'en changer à chaque
 *     requête pour ne jamais être limité. `req.ip` est calculé par Express à
 *     partir du nombre de proxys déclarés de confiance : c'est le premier saut
 *     que l'appelant ne peut pas falsifier.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return Promise.resolve((req.ip as string) ?? 'unknown');
  }

  /** La sonde de disponibilité est appelée en continu par l'hébergeur. */
  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ url?: string }>();
    return Promise.resolve(request?.url === '/health');
  }
}
