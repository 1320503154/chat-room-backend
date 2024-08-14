import { ExecutionContext, SetMetadata, createParamDecorator } from "@nestjs/common";
import { Request } from "express";

// 创建一个装饰器函数 RequireLogin，用于设置元数据 'require-login' 为 true
export const RequireLogin = () => SetMetadata('require-login', true);

// 创建一个参数装饰器函数 UserInfo，用于获取用户信息
export const UserInfo = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
  
    // 如果请求中没有用户信息，则返回 null
    if(!request.user) {
      return null;
    }
    
    // 如果传入了 data 参数，则返回请求中的用户指定信息，否则返回整个用户信息对象
    return data ? request.user[data] : request.user;
  },
)