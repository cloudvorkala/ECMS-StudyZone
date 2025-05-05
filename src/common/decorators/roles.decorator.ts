import { SetMetadata } from '@nestjs/common';

/**
 * 路由级别的角色要求装饰器
 * 使用方式: @Roles('admin', 'mentor')
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);