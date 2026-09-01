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
   * Origines autorisées par CORS. En production on attend une liste explicite
   * (`CORS_ORIGINS=https://app.exemple.com,https://admin.exemple.com`).
   * L'application mobile n'envoie pas d'en-tête Origin : elle n'est pas
   * concernée par cette restriction.
   */
  public getCorsOrigins(): string | string[] {
    const raw = this.getValue('CORS_ORIGINS', false);
    if (!raw) {
      return '*';
    }
    return raw
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);
  }

  /** La documentation Swagger décrit toute la surface d'API : fermée par défaut en prod. */
  public isSwaggerEnabled(): boolean {
    return this.getBoolean('SWAGGER_ENABLED', !this.isProduction());
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

      migrationsTableName: 'migration',

      migrations: ['src/migration/*.ts'],

      ssl: this.isProduction() ? { rejectUnauthorized: false } : false,
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
