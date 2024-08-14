import { Controller, Get, SetMetadata } from '@nestjs/common';
import { AppService } from './app.service';
import { RequireLogin, UserInfo } from './custom.decorator';
import { ApiOperation, ApiResponse,ApiQuery } from '@nestjs/swagger';

@Controller()
// @RequireLogin()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('aaa')
  @RequireLogin()
  // @SetMetadata('require-login', true)
  aaa(@UserInfo() userInfo, @UserInfo('username') username) {
    console.log(userInfo, username);
    return 'aaa';
  }
  @ApiOperation({summary:'接口后面直接附带',description:'接口描述'})
  @ApiResponse({status:200,description:'成功',type:String})
  @ApiQuery({
    name: 'a1',
    type: String,
    description: 'a1 param',
    required: false,
    example: '1111',
})
@ApiQuery({
    name: 'a2',
    type: Number,
    description: 'a2 param',
    required: true,
    example: 2222,
})  

  @Get('bbb')
  bbb() {
      return 'bbb';
  }
}
