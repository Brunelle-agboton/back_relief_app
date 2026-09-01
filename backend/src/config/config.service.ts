import { TypeOrmModuleOptions } from '@nestjs/typeorm';

require('dotenv').config();

/**
 * Point d'entrée unique de la configuration (hors JWT : voir
 * modules/auth/jwt.constants.ts, volontairement sans dépendance à ce service
 * pour rester testable isolément).
 *
 * Deux modes sont distingués via la variable `MODE` :
 *   - `MODE=DEV`  → environnement de développement / CI (tolérant, seed auto, Swagger ouvert)
 *   - toute autre valeur (ou absence) → environnement de production (strict)
 *
 * Les réglages qui NE PEUVENT PAS être mutualisés entre dev et prod sont
 * regroupés ici et documentés dans backend/PRODUCTION.md.
 */
class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value || '';
  }

  private getBoolean(key: string, defaultValue: boolean): boolean {
    const value = this.env[key];
    if (value === undefined || value === '') {
      return defaultValue;
    }
    return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue('PORT', true);
  }

  public isProduction() {
    const mode = this.getValue('MODE', false);
    return mode != 'DEV';
  }

  /* ----------------------------------------------------------------- HTTP */

  /**
   * Origines autorisées par CORS.
   *
   * SEC-10 : `origin: '*'` combiné à l'autorisation de l'en-tête
   * `Authorization` laisse n'importe quel site déclencher des requêtes
   * authentifiées depuis le navigateur d'un utilisateur connecté. En production
   * on exige donc une liste explicite ; à défaut CORS est **désactivé**
   * (`false`) plutôt que grand ouvert. L'application mobile n'envoie pas
   * d'en-tête `Origin` : elle n'est jamais concernée par ce réglage.
   */
  public getCorsOrigins(): string | string[] | false {
    const origins = this.getValue('CORS_ORIGINS', false)
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    if (origins.length > 0) {
      return origins;
    }
    return this.isProduction() ? false : '*';
  }

  /** La documentation Swagger décrit toute la surface d'API : fermée par défaut en prod. */
  public isSwaggerEnabled(): boolean {
    return this.getBoolean('SWAGGER_ENABLED', !this.isProduction());
  }

  /**
   * SEC-10 : si la documentation est malgré tout ouverte en production, elle
   * doit au minimum être protégée. Renvoie les identifiants Basic attendus, ou
   * `null` si aucune protection n'est configurée.
   */
  public getSwaggerCredentials(): { user: string; password: string } | null {
    const user = this.getValue('SWAGGER_USER', false);
    const password = this.getValue('SWAGGER_PASSWORD', false);
    return user && password ? { user, password } : null;
  }

  /**
   * SEC-12 : nombre de proxys de confiance devant l'API.
   *
   * Sans `trust proxy`, Express voit l'adresse du load balancer : le
   * ThrottlerGuard applique alors un quota unique et partagé à l'ensemble des
   * utilisateurs. Avec une valeur trop haute, un client peut à l'inverse forger
   * `X-Forwarded-For` et se rendre indétectable. La valeur correspond au nombre
   * de proxys réellement traversés (1 sur Render).
   */
  public getTrustProxyHops(): number | false {
    const raw = this.getValue('TRUST_PROXY_HOPS', false);
    if (raw) {
      const hops = Number(raw);
      return Number.isInteger(hops) && hops >= 0 ? hops : 1;
    }
    return this.isProduction() ? 1 : false;
  }

  /** Quota global de requêtes par fenêtre, par adresse IP (SEC-12). */
  public getThrottleTtlMs(): number {
    return Number(this.getValue('THROTTLE_TTL_MS', false)) || 60_000;
  }

  public getThrottleLimit(): number {
    return Number(this.getValue('THROTTLE_LIMIT', false)) || 120;
  }

  /* ------------------------------------------------------------- Database */

  /**
   * `synchronize` réécrit le schéma à chaud : acceptable en dev, interdit en
   * prod. `DB_SYNCHRONIZE=true` permet exceptionnellement d'amorcer le schéma
   * lors du tout premier déploiement, tant qu'aucune migration n'existe.
   */
  public isDbSynchronizeEnabled(): boolean {
    return this.getBoolean('DB_SYNCHRONIZE', !this.isProduction());
  }

  /** Le seed de démonstration ne doit jamais s'exécuter sur une base de production. */
  public isSeedEnabled(): boolean {
    return this.getBoolean('SEED_ON_BOOT', !this.isProduction());
  }

  /**
   * SEC-11 : TLS de la connexion PostgreSQL.
   *
   * `rejectUnauthorized: false` établit bien un canal chiffré mais ne vérifie
   * aucun certificat : un attaquant capable de se placer sur le chemin réseau
   * peut se faire passer pour la base. Trois modes explicites remplacent ce
   * comportement implicite :
   *
   *  - `disable`     : pas de TLS (dev local, ou réseau privé Render où la
   *                    connexion ne sort jamais de l'infrastructure) ;
   *  - `require`     : TLS sans vérification — équivalent à l'ancien
   *                    comportement, désormais un choix conscient et tracé ;
   *  - `verify-full` : TLS avec vérification du certificat (défaut en prod),
   *                    exige `POSTGRES_SSL_CA`.
   */
  public getSslConfig(): false | { rejectUnauthorized: boolean; ca?: string } {
    const configured = this.getValue('POSTGRES_SSL_MODE', false).toLowerCase();
    const mode =
      configured || (this.isProduction() ? 'verify-full' : 'disable');

    if (mode === 'disable') {
      return false;
    }

    if (mode === 'require') {
      if (this.isProduction()) {
        // Trace explicite : le mode dégradé ne doit jamais passer inaperçu.
        console.warn(
          "[config] POSTGRES_SSL_MODE=require : le certificat PostgreSQL n'est pas vérifié.",
        );
      }
      return { rejectUnauthorized: false };
    }

    if (mode !== 'verify-full') {
      throw new Error(
        `config error - POSTGRES_SSL_MODE invalide : « ${mode} » (attendu : disable | require | verify-full)`,
      );
    }

    const ca = this.getValue('POSTGRES_SSL_CA', false);
    if (!ca) {
      throw new Error(
        'config error - POSTGRES_SSL_MODE=verify-full exige POSTGRES_SSL_CA ' +
          "(certificat CA de la base, au format PEM). Sur un réseau privé, choisir explicitement POSTGRES_SSL_MODE=disable ; pour conserver l'ancien comportement non vérifié, POSTGRES_SSL_MODE=require.",
      );
    }

    // La variable d'environnement transporte le PEM ; les retours à la ligne
    // échappés (\n) sont restitués pour rester compatible avec les dashboards
    // qui n'acceptent pas les valeurs multilignes.
    return { rejectUnauthorized: true, ca: ca.replace(/\\n/g, '\n') };
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',

      host: this.getValue('POSTGRES_HOST'),
      port: parseInt(this.getValue('POSTGRES_PORT')),
      username: this.getValue('POSTGRES_USER'),
      password: this.getValue('POSTGRES_PASSWORD'),
      database: this.getValue('POSTGRES_DATABASE'),

      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.isDbSynchronizeEnabled(),

      migrationsTableName: 'migrations',
      // Les migrations sont jouées par `npm run migration:run` (voir
      // src/database/data-source.ts), jamais implicitement au démarrage.
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      migrationsRun: false,

      ssl: this.getSslConfig(),
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DATABASE',
  'JWT_SECRET',
]);

export { configService, ConfigService };
