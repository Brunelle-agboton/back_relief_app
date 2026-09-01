import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebrtcGateway } from './webrtc.gateway';
import { RoomsController } from './rooms.controller';
import { getAccessTokenTtl, getJwtSecret } from './../auth/jwt.constants';

@Module({
  imports: [
    // SEC-08 : plus de repli `|| 'secretKey'`, qui rendait tout jeton forgeable
    // si la variable d'environnement venait à manquer.
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: getJwtSecret(),
        signOptions: { expiresIn: getAccessTokenTtl() },
      }),
    }),
  ],
  providers: [WebrtcGateway],
  controllers: [RoomsController],
})
export class WebrtcModule {}
