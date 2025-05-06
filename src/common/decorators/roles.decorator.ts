import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/schemas/user.schema';

/**
 * 路由级别的角色要求装饰器
 * 使用方式: @Roles(UserRole.ADMIN, UserRole.MENTOR)
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
