import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { DataSource } from 'typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { RestModule } from './modules/rest/rest.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AuthController } from './modules/auth/auth.controller';
import { HealthModule } from './modules/health/health.module';
import { UserController } from './modules/user/user.controller';
import { HealthController } from './modules/health/health.controller';
import { RestController } from './modules/rest/rest.controller';
import { NotificationController } from './modules/notification/notification.controller';


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
    RestModule,
    NotificationModule,
    // Other modules can be imported here
  ],
  controllers: [AppController, UserController, HealthController, AuthController, RestController, NotificationController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {
  }
}
