import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { PractitionerProfileModule } from '../practitioner_profile/practitioner_profile.module';
import { AppointmentModule } from '../appointment/appointment.module';
import { getAccessTokenTtl, getJwtSecret } from './jwt.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([]),
    forwardRef(() => UserModule),
    forwardRef(() => PractitionerProfileModule),
    forwardRef(() => AppointmentModule),
    PassportModule,
    // registerAsync : le secret est résolu au démarrage de l'application, ce qui
    // fait échouer le boot (et non une requête sur deux) si JWT_SECRET manque.
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: getAccessTokenTtl() },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
