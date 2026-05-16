import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UnLoginException } from './unlogin.filter';

@Injectable()
export class LoginGuard implements CanActivate {

  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(JwtService)
  private jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const requireLogin = this.reflector.getAllAndOverride<boolean>('require-login', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireLogin) {
      return true;
    }

    const authHeader = request.headers['authorization'] as string || request.headers['authorization'] as string;;
    console.log('authHeader', authHeader);
    if (!authHeader) {
      throw new UnLoginException('用户未登录');
    }

    try {
      const token = authHeader.split(' ')[1];
      const payload = this.jwtService.verify(token);
      request.user = payload; // 将用户信息附加到请求对象上，供后续使用
      return true;
    } catch (err) {
      throw new UnLoginException('token 已失效，请重新登录');
    }
  }
}
