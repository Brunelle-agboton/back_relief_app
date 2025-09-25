import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { WebrtcGateway } from './webrtc.gateway';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '10min' },
    }),
  ],
  providers: [WebrtcGateway],
  controllers: [RoomsController],
})
export class WebrtcModule {}
