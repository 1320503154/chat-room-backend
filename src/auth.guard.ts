// 导入NestJS的CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException模块
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
// 导入NestJS的Reflector模块
import { Reflector } from '@nestjs/core';
// 导入NestJS的JwtService模块
import { JwtService } from '@nestjs/jwt';
// 导入express的Request, Response模块
import { Request, Response } from 'express';
// 导入rxjs的Observable模块
import { Observable } from 'rxjs';

// 定义JwtUserData接口，包含userId和username属性
interface JwtUserData {
  userId: number;
  username: string;
}

// 扩展express的Request接口，添加user属性
declare module 'express' {
  interface Request {
    user: JwtUserData
  }
}

// 使用Injectable装饰器，使AuthGuard类可以被注入
@Injectable()
export class AuthGuard implements CanActivate {
  
  // 使用Inject装饰器，注入Reflector实例
  @Inject()
  private reflector: Reflector;

  // 使用Inject装饰器，注入JwtService实例
  @Inject(JwtService)
  private jwtService: JwtService;
  
  // 实现CanActivate接口的canActivate方法
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 从ExecutionContext中获取Request实例
    const request: Request = context.switchToHttp().getRequest();
    // 从ExecutionContext中获取Response实例
    const response: Response = context.switchToHttp().getResponse();

    // 使用Reflector实例获取'require-login'元数据
    const requireLogin = this.reflector.getAllAndOverride('require-login', [
      context.getClass(),
      context.getHandler()
    ]);

    // 如果不需要登录，直接返回true
    if(!requireLogin) {
      return true;
    }

    // 从Request的headers中获取authorization
    const authorization = request.headers.authorization;

    // 如果没有authorization，抛出UnauthorizedException异常
    if(!authorization) {
      throw new UnauthorizedException('用户未登录');
    }

    try{
      // 从authorization中获取token
      const token = authorization.split(' ')[1];
      // 使用JwtService的verify方法验证token，并获取数据
      const data = this.jwtService.verify<JwtUserData>(token);

      // 将数据设置到Request的user属性上
      request.user = {
        userId: data.userId,
        username: data.username,
      }

      // 使用Response的header方法设置token
      response.header('token', this.jwtService.sign({
        userId: data.userId,
        username: data.username
      }, {
        expiresIn: '7d'// 设置token过期时间为7天
      }))

      // 返回true
      return true;
    } catch(e) {
      // 如果出现异常，打印异常并抛出UnauthorizedException异常
      console.log(e);
      throw new UnauthorizedException('token 失效，请重新登录');
    }
  }
}