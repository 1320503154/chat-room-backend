import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin, UserInfo } from './custom.decorator';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('app') // 添加标签
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: '获取欢迎信息', description: '返回欢迎信息' })
  @ApiResponse({ status: 200, description: '成功', type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('userInfo')
  @RequireLogin()
  @ApiOperation({ summary: '获取用户信息', description: '返回用户信息和用户名' })
  @ApiResponse({ status: 200, description: '成功', type: Object })
  aaa(@UserInfo() userInfo, @UserInfo('username') username) {
    console.log(userInfo, username);
    return {
      userInfo,
      username,
    };
  }
}