// module fileName:redis.module.ts
import { Global, Module } from '@nestjs/common'; // 导入NestJS的全局和模块装饰器
import { RedisService } from './redis.service'; // 导入Redis服务
import { createClient } from 'redis'; // 导入Redis客户端创建函数
import * as dotenv from 'dotenv';
dotenv.config();

@Global() // 将模块标记为全局模块
@Module({
  providers: [ // 提供者数组
    RedisService, // 注册Redis服务
    {
      provide: 'REDIS_CLIENT', // 提供Redis客户端的标识符
      async useFactory() { // 使用工厂函数异步创建Redis客户端
        const client = createClient({ // 创建Redis客户端实例
            socket: { 
                host: process.env.REDIS_HOST, // Redis服务器主机
                port: Number(process.env.REDIS_PORT) // Redis服务器端口
            },
            database: 2 // 选择使用的Redis数据库
        });
        await client.connect(); // 连接到Redis服务器
        return client; // 返回连接的Redis客户端
      }
    }
  ],
  exports: [RedisService] // 导出Redis服务以供其他模块使用
})
export class RedisModule {} // 定义Redis模块类