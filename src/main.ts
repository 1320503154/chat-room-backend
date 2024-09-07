import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { SwaggerModule,DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ResultInterceptor } from './interceptors/result.interceptor';

// 定义异步启动函数
async function bootstrap() {
  // 创建 Nest 应用实例
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  const config=new DocumentBuilder().setTitle("在线聊天室API文档").setDescription("在线聊天室API文档").setVersion("1.0").build();
  const document=SwaggerModule.createDocument(app,config);
  SwaggerModule.setup('api-docs',app,document);
  // 使用全局验证管道，启用数据转换
  app.useGlobalPipes(new ValidationPipe({ transform: true}));

  app.useGlobalInterceptors(new ResultInterceptor());

  // 启用跨域资源共享，并暴露 Token 头
  app.enableCors({
    exposedHeaders: ['Token']
  });
  // 监听 3005 端口
  await app.listen(3005);
}

// 调用启动函数
bootstrap();