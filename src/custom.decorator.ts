import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const RequireLogin = () => SetMetadata('require-login', true);

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('require-permissions', permissions);

/** 自定义装饰器，用于获取当前用户信息 */
export const UserInfo = createParamDecorator((data: string, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  if (!request.user) {
    return null;
  }

  return data ? request.user?.[data] : request.user;
});