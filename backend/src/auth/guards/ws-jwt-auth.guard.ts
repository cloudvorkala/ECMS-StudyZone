import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      // 尝试从 query 或 headers 中获取 token
      const authToken = client.handshake.query.token ||
                       client.handshake.headers.token ||
                       client.handshake.auth.token;

      if (!authToken) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(authToken, {
        secret: process.env.JWT_SECRET,
      });

      // user info attached to socket object
      client.data.user = payload;

      return true;
    } catch (err) {
      console.error('WebSocket authentication error:', err);
      throw new WsException('Unauthorized');
    }
  }
}