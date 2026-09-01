import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { buildLoggerConfig } from './common/logging/logger.config';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { DataSource } from 'typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { ProgramModule } from './modules/program/program.module';
import { ProgramLineModule } from './modules/program-line/program-line.module';
import { ActivityModule } from './modules/activity/activity.module';
import { PractitionerProfileModule } from './modules/practitioner_profile/practitioner_profile.module';
import { PractitionerDiplomeModule } from './modules/practitioner_diplome/practitioner_diplome.module';
import { SummaryModule } from './modules/summary/summary.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
// import { SummaryModule } from './modules/summary/summary.module';
import { WebrtcModule } from './modules/rooms/webrtc.module';
const imagesPath = join(
  __dirname,
  '..',
  '..',
  'front-client',
  'assets',
  'images',
);
console.log('→ Serving images from:', imagesPath);
@Module({
  imports: [
    LoggerModule.forRoot(buildLoggerConfig()),
    /**
     * SEC-12 : le quota par défaut était de 10 requêtes/minute pour la totalité
     * de l'API — un seul écran de l'application en consomme davantage. Le
     * plafond global est relevé et paramétrable ; les routes sensibles
     * (connexion, inscription) conservent leur propre @Throttle strict.
     */
    ThrottlerModule.forRoot([
      {
        ttl: configService.getThrottleTtlMs(),
        limit: configService.getThrottleLimit(),
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        return configService.getTypeOrmConfig();
      },
    }),
    UserModule,
    HealthModule,
    AuthModule,
    NotificationModule,
    ExerciseModule,
    ProgramModule,
    ProgramLineModule,
    ActivityModule,
    SummaryModule,
    PractitionerProfileModule,
    PractitionerDiplomeModule,
    AvailabilityModule,
    AppointmentModule,
    WebrtcModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'front-client', 'assets', 'images'),
      serveRoot: '/images',
      exclude: ['/api*'],

      serveStaticOptions: {
        setHeaders: (res, path) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD');
        },
      },
    }),

    // Other modules can be imported here
  ],
  // Chaque contrôleur est déclaré par son propre module (importé ci-dessus).
  // Les redéclarer ici les instanciait une seconde fois et enregistrait chaque
  // route en double, rendant l'ordre de résolution difficile à raisonner —
  // c'est ce qui rendait le conflit sur GET /health si peu lisible.
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
    /**
     * SEC-01 : applique @Exclude() à toutes les réponses. Sans cet
     * intercepteur global, le hash bcrypt de `User` resterait sérialisé par
     * les routes qui renvoient l'entité telle quelle.
     */
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
