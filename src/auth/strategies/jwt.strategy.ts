// src/auth/strategies/jwt.strategy.ts
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    try {
      // payload.sub 是用户ID
      const user = await this.usersService.findById(payload.sub);

      // 如果找不到用户，拒绝访问
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // 返回用户信息(不包含敏感数据)
      return {
        id: user._id,
        email: user.email,
        username: user.username,
        roles: user.roles
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}