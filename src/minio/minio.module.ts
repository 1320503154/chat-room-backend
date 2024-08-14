import { Global, Module } from '@nestjs/common';
import { MinioController } from './minio.controller';
import * as Minio from 'minio';

@Global()
@Module({
    providers: [
        {
            provide: 'MINIO_CLIENT',
            async useFactory() {
                const client = new Minio.Client({
                        endPoint: 'localhost',
                        port: 9000,
                        useSSL: false,
                        accessKey: 'oJhfqfWSNNmtN65tH233',
                        secretKey: 'daVL0MFRhf2UOQIvm7KTZCrX3l7B5E9yw5ttFqok'
                    })
                return client;
            }
          }
    ],
    exports: ['MINIO_CLIENT'],
    controllers: [MinioController]
})
export class MinioModule {}