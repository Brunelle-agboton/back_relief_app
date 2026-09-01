import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { seedRestExercise } from './seed';
import { runSeed } from './seedTF';
import { Exercise } from './modules/exercise/entities/exercise.entity';
import { configService } from './config/config.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Render / pgbouncer placent l'API derrière un reverse proxy : sans cela le
  // ThrottlerGuard voit l'IP du proxy et applique un quota global à tous.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  // En-têtes de sécurité de base (sans dépendance supplémentaire).
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    if (configService.isProduction()) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }
    next();
  });

  app.enableCors({
    origin: configService.getCorsOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization, X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

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

  if (configService.isSeedEnabled()) {
    const dataSource = app.get(DataSource);
    try {
      const exerciseRepository = dataSource.getRepository(Exercise);

      const existingData = await exerciseRepository.count();
      if (existingData === 0) {
        logger.log('Seeding database...');
        await seedRestExercise(dataSource);
        logger.log('Seeding completed.');
      } else {
        logger.log('Database already seeded. Skipping seed.');
      }

      await runSeed(dataSource);
    } catch (error) {
      logger.error(
        'Seed failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  } else {
    logger.log('Seed désactivé (SEED_ON_BOOT=false).');
  }

  // La documentation décrit toute la surface d'API : fermée par défaut en prod.
  if (configService.isSwaggerEnabled()) {
    const config = new DocumentBuilder()
      .setTitle('Health Tracker API')
      .setDescription('API for health tracking app')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger exposé sur /api');
  }

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  logger.log(
    `API démarrée (mode ${configService.isProduction() ? 'PROD' : 'DEV'})`,
  );
}
bootstrap();
