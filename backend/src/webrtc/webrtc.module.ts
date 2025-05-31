import { Module } from '@nestjs/common';
import { WebRTCService } from './webrtc.service';
import { WebRTCGateway } from './webrtc.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [WebRTCService, WebRTCGateway],
  exports: [WebRTCService],
})
export class WebRTCModule {}