import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { DataSource } from 'typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthController } from './modules/auth/auth.controller';
import { HealthModule } from './modules/health/health.module';
import { UserController } from './modules/user/user.controller';
import { HealthController } from './modules/health/health.controller';
import { NotificationController } from './modules/notification/notification.controller';
import { ExerciseController } from './modules/exercise/exercise.controller';
import { ProgramController } from './modules/program/program.controller';
import { ProgramLineController } from './modules/program-line/program-line.controller'
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ExerciseModule } from './modules/exercise/exercise.module';
import { ProgramModule } from './modules/program/program.module';
import { ProgramLineModule } from './modules/program-line/program-line.module';

const imagesPath = join(__dirname, '..', '..', 'front-client', 'assets', 'images');
console.log('→ Serving images from:', imagesPath);
@Module({
  imports: [
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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..','..', 'front-client','assets', 'images'),
      serveRoot: '/images',
      exclude: ['/api*'],
    }),

    // Other modules can be imported here
  ],
  controllers: [AppController, UserController, HealthController, AuthController, NotificationController, ExerciseController, ProgramController, ProgramLineController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    
  }
}
