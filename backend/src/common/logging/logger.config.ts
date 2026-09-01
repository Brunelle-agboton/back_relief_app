import { randomUUID } from 'crypto';
import type { Params } from 'nestjs-pino';
import { configService } from '../../config/config.service';

/**
 * SEC-14 : journalisation structurée.
 *
 * En production les logs sont émis en JSON sur une seule ligne, exploitables
 * par n'importe quel collecteur ; en développement ils restent lisibles à
 * l'œil via pino-pretty.
 *
 * Les en-têtes porteurs de secrets sont expurgés : sans cela, chaque requête
 * authentifiée écrirait un jeton JWT valide en clair dans les journaux.
 */
export function buildLoggerConfig(): Params {
  const isProduction = configService.isProduction();

  return {
    pinoHttp: {
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
      transport: isProduction
        ? undefined
        : { target: 'pino-pretty', options: { singleLine: true } },

      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.headers["x-api-key"]',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },

      // Corrèle les lignes d'une même requête, et propage l'identifiant fourni
      // par le load balancer quand il y en a un.
      genReqId: (req, res) => {
        const existing = req.headers['x-request-id'];
        const id =
          (Array.isArray(existing) ? existing[0] : existing) || randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
      },

      // La sonde de disponibilité est appelée en continu : la journaliser
      // noierait tout le reste.
      autoLogging: {
        ignore: (req) => req.url === '/health',
      },
    },
  };
}
