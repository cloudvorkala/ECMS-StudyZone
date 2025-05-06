// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../users/schemas/user.schema';
import { Request } from 'express';

// 定义扩展的 Request 接口，包含 user 属性
interface RequestWithUser extends Request {
  user: UserDocument;
}

/**
 * 获取当前经过身份验证的用户的装饰器
 * 使用方式: @CurrentUser() user
 * 装饰器已经包含了 UserDocument 类型，不需要额外添加类型注解
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserDocument => {
    // 使用自定义的扩展 Request 类型
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();

    // 由于已经定义了类型，可以直接返回 user 属性
    return request.user;
  },
);
