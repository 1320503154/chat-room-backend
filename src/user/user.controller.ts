import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, Query, BadRequestException } from '@nestjs/common'; // 从 @nestjs/common 导入所需的装饰器和异常类
import { UserService } from './user.service'; // 导入 UserService
import { RegisterUserDto } from './dto/register-user.dto'; // 导入 RegisterUserDto 数据传输对象
import { EmailService } from 'src/email/email.service'; // 导入 EmailService
import { RedisService } from 'src/redis/redis.service'; // 导入 RedisService
import { LoginUserDto } from './dto/login-user.dto'; // 导入 LoginUserDto 数据传输对象
import { JwtService } from '@nestjs/jwt'; // 导入 JwtService
import { RequireLogin, UserInfo } from 'src/custom.decorator'; // 导入自定义装饰器 RequireLogin 和 UserInfo
import { UpdateUserPasswordDto } from './dto/update-user-password.dto'; // 导入 UpdateUserPasswordDto 数据传输对象
import { UpdateUserDto } from './dto/update-user.dto'; // 导入 UpdateUserDto 数据传输对象
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger'; // 导入 Swagger 装饰器

@ApiTags('user') // 定义 Swagger 标签
@Controller('user') // 定义控制器的路由前缀为 'user'
export class UserController {
  constructor(private readonly userService: UserService) {} // 构造函数注入 UserService

  @Post('register') // 定义 POST 路由 'register'
  @ApiOperation({ summary: '用户注册' }) // Swagger 操作描述
  @ApiBody({ type: RegisterUserDto }) // Swagger 请求体描述
  async register(@Body() registerUser: RegisterUserDto) { // 处理注册请求，接收 RegisterUserDto 类型的请求体
    return await this.userService.register(registerUser); // 调用 userService 的 register 方法
  }

  @Inject(EmailService) // 注入 EmailService
  private emailService: EmailService; // 定义 emailService 属性

  @Inject(RedisService) // 注入 RedisService
  private redisService: RedisService; // 定义 redisService 属性

  @Get('register-captcha') // 定义 GET 路由 'register-captcha'
  @ApiOperation({ summary: '获取注册验证码' }) // Swagger 操作描述
  @ApiQuery({ name: 'address', required: true, description: '邮箱地址' }) // Swagger 查询参数描述
  async captcha(@Query('address') address: string) { // 处理验证码请求，接收地址参数
    if(!address) { // 如果地址为空，抛出异常
      throw new BadRequestException('邮箱地址不能为空');
    }
    const code = Math.random().toString().slice(2,8); // 生成随机验证码

    await this.redisService.set(`captcha_${address}`, code, 5 * 60); // 将验证码存储到 Redis，过期时间为5分钟

    await this.emailService.sendMail({ // 发送邮件
      to: address,
      subject: '注册验证码',
      html: `<p>你的注册验证码是 ${code}</p>`
    });
    return '发送成功'; // 返回发送成功信息
  }

  @Inject(JwtService) // 注入 JwtService
  private jwtService: JwtService; // 定义 jwtService 属性

  @Post('login') // 定义 POST 路由 'login'
  @ApiOperation({ summary: '用户登录' }) // Swagger 操作描述
  @ApiBody({ type: LoginUserDto }) // Swagger 请求体描述
  async userLogin(@Body() loginUser: LoginUserDto) { // 处理登录请求，接收 LoginUserDto 类型的请求体
    const user = await this.userService.login(loginUser); // 调用 userService 的 login 方法

    return {
      user,
      token: this.jwtService.sign({ // 生成 JWT token
        userId: user.id,
        username: user.username
      }, {
        expiresIn: '7d' // 设置 token 过期时间为7天
      })
    };
  }

  @Get('info') // 定义 GET 路由 'info'
  @RequireLogin() // 使用 RequireLogin 装饰器，要求登录
  @ApiOperation({ summary: '获取用户信息' }) // Swagger 操作描述
  async info(@UserInfo('userId') userId: number) { // 获取用户信息，接收 userId 参数
    return this.userService.findUserDetailById(userId); // 调用 userService 的 findUserDetailById 方法
  }

  @Post('update_password') // 定义 POST 路由 'update_password'
  @ApiOperation({ summary: '更新用户密码' }) // Swagger 操作描述
  @ApiBody({ type: UpdateUserPasswordDto }) // Swagger 请求体描述
  async updatePassword(@Body() passwordDto: UpdateUserPasswordDto) { // 处理更新密码请求，接收 UpdateUserPasswordDto 类型的请求体
      return this.userService.updatePassword(passwordDto); // 调用 userService 的 updatePassword 方法
  }

  @Get('update_password/captcha') // 定义 GET 路由 'update_password/captcha'
  @ApiOperation({ summary: '获取更新密码验证码' }) // Swagger 操作描述
  @ApiQuery({ name: 'address', required: true, description: '邮箱地址' }) // Swagger 查询参数描述
  async updatePasswordCaptcha(@Query('address') address: string) { // 处理更新密码验证码请求，接收地址参数
    if(!address) { // 如果地址为空，抛出异常
      throw new BadRequestException('邮箱地址不能为空');
    }
    const code = Math.random().toString().slice(2,8); // 生成随机验证码

    await this.redisService.set(`update_password_captcha_${address}`, code, 10 * 60); // 将验证码存储到 Redis，过期时间为10分钟

    await this.emailService.sendMail({ // 发送邮件
      to: address,
      subject: '更改密码验证码',
      html: `<p>你的更改密码验证码是 ${code}</p>`
    });
    return '发送成功'; // 返回发送成功信息
  }

  @Post('update') // 定义 POST 路由 'update'
  @RequireLogin() // 使用 RequireLogin 装饰器，要求登录
  @ApiOperation({ summary: '更新用户信息' }) // Swagger 操作描述
  @ApiBody({ type: UpdateUserDto }) // Swagger 请求体描述
  async update(@UserInfo('userId') userId: number, @Body() updateUserDto: UpdateUserDto) { // 处理更新用户信息请求，接收 userId 和 UpdateUserDto 类型的请求体
      return await this.userService.update(userId, updateUserDto); // 调用 userService 的 update 方法
  }

  @Get('update/captcha') // 定义 GET 路由 'update/captcha'
  @RequireLogin() // 使用 RequireLogin 装饰器，要求登录
  @ApiOperation({ summary: '获取更新用户信息验证码' }) // Swagger 操作描述
  async updateCaptcha(@UserInfo('userId') userId: number) { // 处理更新用户信息验证码请求，接收 userId 参数
    const { email: address } = await this.userService.findUserDetailById(userId); // 获取用户的邮箱地址

    const code = Math.random().toString().slice(2,8); // 生成随机验证码

    await this.redisService.set(`update_user_captcha_${address}`, code, 10 * 60); // 将验证码存储到 Redis，过期时间为10分钟

    await this.emailService.sendMail({ // 发送邮件
      to: address,
      subject: '更改用户信息验证码',
      html: `<p>你的验证码是 ${code}</p>`
    });
    return '发送成功'; // 返回发送成功信息
  }
}