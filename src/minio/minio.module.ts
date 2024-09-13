import { Global, Module } from '@nestjs/common';
import { MinioController } from './minio.controller';
import { MinioService } from './minio.service';
import * as OSS from 'ali-oss';
import { STS } from 'ali-oss';
import * as dotenv from 'dotenv';
dotenv.config();

@Global()
@Module({
    providers: [
        {
            provide: 'MINIO_CLIENT',
            async useFactory() {
                const { ALIYUN_OSS_ACCESS_KEY_ID, ALIYUN_OSS_ACCESS_KEY_SECRET, ALIYUN_OSS_ROLE_ARN } = process.env;
               
                const sts = new STS({
                  accessKeyId: ALIYUN_OSS_ACCESS_KEY_ID,
                  accessKeySecret: ALIYUN_OSS_ACCESS_KEY_SECRET,
                });
            
                // Assuming role and generating STS token
                const { credentials } = await sts.assumeRole(
                  ALIYUN_OSS_ROLE_ARN,
                  '',
                  Number(process.env.ALIYUN_OSS_EXPIRE_TIME),
                  'sessiontest'
                );
            
                const client = new OSS({
                  accessKeyId: credentials.AccessKeyId,
                  accessKeySecret: credentials.AccessKeySecret,
                  stsToken: credentials.SecurityToken,
                  region: process.env.ALIYUN_OSS_REGION,
                  bucket: process.env.ALIYUN_OSS_BUCKET,
                });
            
                return client;
            }
          },
        MinioService
    ],
    exports: ['MINIO_CLIENT'],
    controllers: [MinioController]
})
export class MinioModule {}