import { Global, Module } from '@nestjs/common';
import { MinioController } from './minio.controller';
import * as Minio from 'minio';
//导入环境变量模块
import * as dotenv from 'dotenv';
dotenv.config();

@Global()
@Module({
    providers: [
        {
            provide: 'MINIO_CLIENT',
            async useFactory() {
                const client = new Minio.Client({
                        endPoint: process.env.MINIO_ENDPOINT,
                        port: Number(process.env.MINIO_PORT),
                        useSSL: false,
                        accessKey: process.env.MINIO_ACCESS_KEY,
                        secretKey: process.env.MINIO_SECRET_KEY
                    })
                return client;
            }
          }
    ],
    exports: ['MINIO_CLIENT'],
    controllers: [MinioController]
})
export class MinioModule {}