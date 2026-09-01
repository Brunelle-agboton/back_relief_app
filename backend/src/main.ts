import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { runSeeds } from './database/seeds/run-seeds';
import { configService } from './config/config.service';
import { swaggerBasicAuth } from './common/middleware/swagger-basic-auth.middleware';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Les logs émis pendant l'amorçage sont conservés puis rejoués par le
    // logger structuré une fois celui-ci disponible (SEC-14).
    bufferLogs: true,
  });

  const logger = app.get(Logger);
  app.useLogger(logger);

  /**
   * SEC-12 : nombre de proxys de confiance. Sans cela, Express voit l'adresse
   * du load balancer et le ThrottlerGuard applique un quota unique partagé par
   * tous les utilisateurs.
   */
  app.set('trust proxy', configService.getTrustProxyHops());
  app.disable('x-powered-by');

  /**
   * SEC-14 : en-têtes de sécurité.
   *  - CSP désactivée : l'API ne sert pas de HTML, et l'interface Swagger a
   *    besoin de styles et scripts en ligne ;
   *  - CORP en `cross-origin` : les illustrations d'exercices sont chargées
   *    depuis l'application mobile, une politique `same-origin` les bloquerait.
   */
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(compression());

  /**
   * SEC-10 : `origin: '*'` avec l'en-tête `Authorization` autorisé permet à
   * n'importe quel site d'émettre des requêtes authentifiées depuis le
   * navigateur d'un utilisateur connecté. En production, sans liste blanche
   * explicite, CORS est désactivé : l'application mobile n'envoie pas
   * d'en-tête `Origin` et n'en a pas besoin.
   */
  const corsOrigins = configService.getCorsOrigins();
  if (corsOrigins === false) {
    logger.log(
      'CORS désactivé (aucune origine déclarée dans CORS_ORIGINS). ' +
        "Sans effet sur l'application mobile, qui n'envoie pas d'en-tête Origin.",
    );
  } else {
    app.enableCors({
      origin: corsOrigins,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
  }

  /**
   * SEC-05 : validation globale.
   *  - `whitelist`   : supprime tout champ non déclaré dans le DTO — c'est ce
   *    qui neutralise le mass assignment (Object.assign brut côté service) et
   *    l'escalade de privilèges via `role` (SEC-03).
   *  - `transform`   : instancie réellement le DTO, sans quoi les décorateurs
   *    @Type/@Transform et les coercitions ne s'appliquent pas.
   *  - `forbidNonWhitelisted` reste à false : les clients mobiles déjà publiés
   *    envoient des champs surnuméraires (`userId`, `adresse`…). Ils sont
   *    supprimés silencieusement plutôt que de provoquer un 400. À passer à
   *    true une fois le parc mobile aligné.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // MET-04 : le seed ne s'exécute qu'en développement, sous verrou, et une
  // erreur interrompt le démarrage au lieu d'être avalée.
  if (configService.isSeedEnabled()) {
    await runSeeds(app.get(DataSource));
  } else {
    logger.log('Seed désactivé (SEED_ON_BOOT=false).');
  }

  /**
   * SEC-10 : la documentation cartographie toute la surface d'API. Elle est
   * fermée par défaut en production ; si elle y est malgré tout ouverte, elle
   * doit être protégée par authentification.
   */
  if (configService.isSwaggerEnabled()) {
    const credentials = configService.getSwaggerCredentials();

    if (configService.isProduction() && !credentials) {
      throw new Error(
        'config error - SWAGGER_ENABLED=true en production exige SWAGGER_USER et SWAGGER_PASSWORD.',
      );
    }
    if (credentials) {
      app.use(['/api', '/api-json'], swaggerBasicAuth(credentials));
    }

    const config = new DocumentBuilder()
      .setTitle('Health Tracker API')
      .setDescription('API for health tracking app')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log(
      `Swagger exposé sur /api${credentials ? ' (protégé par authentification)' : ''}`,
    );
  }

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  logger.log(
    `API démarrée (mode ${configService.isProduction() ? 'PROD' : 'DEV'})`,
  );
}

void bootstrap();
