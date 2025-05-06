// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  //ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//import { Observable } from 'rxjs';
import { User } from 'src/users/schemas/user.schema';

/**
 * JWT认证守卫，用于保护需要用户登录的路由
 * 使用方式：@UseGuards(JwtAuthGuard)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // 保持与基类相同的方法签名
  handleRequest<TUser = User>(
    err: any,
    user: any,
    //context?: ExecutionContext,
    //status?: any,
  ): TUser {
    // 如果有错误或者没有找到用户，抛出异常
    if (err || !user) {
      throw (
        err || new UnauthorizedException('Please login to access this resource')
      );
    }

    // 返回用户信息，使用类型断言确保返回类型兼容
    return user as TUser;
  }
}
