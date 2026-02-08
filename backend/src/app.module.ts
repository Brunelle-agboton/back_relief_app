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
import { ProgramLineController } from './modules/program-line/program-line.controller';
import { ActivityController} from './modules/activity/activity.controller'
import { SummaryController } from './modules/summary/summary.controller';
import { AppointmentController } from './modules/appointment/appointment.controller';
import { PractitionerProfileController } from './modules/practitioner_profile/practitioner_profile.controller';
import { PractitionerDiplomeController } from './modules/practitioner_diplome/practitioner_diplome.controller';
import { AvailabilityController } from './modules/availability/availability.controller';
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
import { RoomsController } from './modules/rooms/rooms.controller';
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
    ActivityModule,
    SummaryModule,
    PractitionerProfileModule,
    PractitionerDiplomeModule,
    AvailabilityModule,
    AppointmentModule,
    WebrtcModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..', '..', 'front-client', 'assets', 'images'),
      serveRoot: '/images',
      exclude: ['/api*'],

       serveStaticOptions: {
        setHeaders: (res, path) => {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD');
        }
      }
    }),
    ActivityModule,

    // Other modules can be imported here
  ],
  controllers: [AppController, UserController, HealthController, AuthController, NotificationController, RoomsController,
    ExerciseController, ProgramController, ProgramLineController, ActivityController, SummaryController, 
    AppointmentController,AvailabilityController, PractitionerProfileController, PractitionerDiplomeController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
    
  }
}
