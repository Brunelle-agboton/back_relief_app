import { timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

/** Comparaison à temps constant, pour ne pas divulguer le secret octet par octet. */
function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * SEC-10 : protège la documentation Swagger par authentification HTTP Basic
 * lorsqu'elle est exposée sur un environnement non public.
 */
export function swaggerBasicAuth(credentials: {
  user: string;
  password: string;
}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const header = req.headers.authorization ?? '';

    if (header.startsWith('Basic ')) {
      const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
      const separator = decoded.indexOf(':');
      const user = decoded.slice(0, separator);
      const password = decoded.slice(separator + 1);

      if (
        safeEqual(user, credentials.user) &&
        safeEqual(password, credentials.password)
      ) {
        next();
        return;
      }
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="API documentation"');
    res.status(401).send('Authentication required');
  };
}
