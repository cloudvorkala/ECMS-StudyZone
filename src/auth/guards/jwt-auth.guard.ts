// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT认证守卫，用于保护需要用户登录的路由
 * 使用方式：@UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 调用父类的canActivate方法，进行JWT验证
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // 如果有错误或者没有找到用户，抛出异常
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Please login to access this resource')
      );
    }

    // 返回用户信息
    return user;
  }
}
