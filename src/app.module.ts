// 导入NestJS的Module模块
import { Module } from '@nestjs/common';
// 导入AppController
import { AppController } from './app.controller';
// 导入AppService
import { AppService } from './app.service';
// 导入PrismaService
import { PrismaService } from './prisma/prisma.service';
// 导入UserModule
import { UserModule } from './user/user.module';
// 导入PrismaModule
import { PrismaModule } from './prisma/prisma.module';
// 导入RedisModule
import { RedisModule } from './redis/redis.module';
// 导入EmailModule
import { EmailModule } from './email/email.module';
// 导入NestJS的JwtModule模块
import { JwtModule } from '@nestjs/jwt';
// 导入NestJS的APP_GUARD模块
import { APP_GUARD } from '@nestjs/core';
// 导入AuthGuard
import { AuthGuard } from './auth.guard';
// 导入FriendshipModule
import { FriendshipModule } from './friendship/friendship.module';
// 导入ChatroomModule
import { ChatroomModule } from './chatroom/chatroom.module';
// 导入MinioModule
import { MinioModule } from './minio/minio.module';
// 导入ChatModule
import { ChatModule } from './chat/chat.module';
// 导入ChatHistoryModule
import { ChatHistoryModule } from './chat-history/chat-history.module';

// 使用Module装饰器，定义AppModule类
@Module({
  // 定义imports属性，导入其他模块
  imports: [
    UserModule, 
    PrismaModule, 
    RedisModule, 
    EmailModule,
    // 使用JwtModule的registerAsync方法，注册JwtModule
    JwtModule.registerAsync({
      global: true,
      useFactory() {
        return {
          secret: 'LHGSecretKey', // 设置密钥
          signOptions: {
            expiresIn: '3000m' // 默认 30 分钟
          }
        }
      }
    }),
    FriendshipModule,
    ChatroomModule,
    MinioModule,
    ChatModule,
    ChatHistoryModule,
  ],
  // 定义controllers属性，导入控制器
  controllers: [AppController],
  // 定义providers属性，导入服务
  providers: [
    AppService, 
    PrismaService, 
    // 使用provide和useClass属性，注册AuthGuard
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
})
// 导出AppModule类
export class AppModule {}