import { Controller, Get, Inject, Query } from '@nestjs/common';
import * as OSS from 'ali-oss';
import { STS } from 'ali-oss';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import * as moment from 'moment';
import { RequireLogin } from 'src/custom.decorator';

@ApiTags('minio')
@RequireLogin()
@Controller('minio')
export class MinioController {

    @Inject('MINIO_CLIENT')
    private minioClient: OSS.Client;

    @Get('presignedUrl')
    @ApiOperation({ summary: '获取预签名的上传URL' })
    @ApiQuery({ name: 'name', required: true, description: '对象名称' })
    async presignedPutObject(@Query('name') name: string) {
      const expireTime = Number(process.env.ALIYUN_OSS_EXPIRE_TIME);
      console.log('In minio.controller.ts ALIYUN_OSS_EXPIRE_TIME::: ', process.env.ALIYUN_OSS_EXPIRE_TIME);
      const date = new Date();
      date.setSeconds(date.getSeconds() + expireTime);
  
      const dir = 'user-dirs/';
      const policy = {
        expiration: date.toISOString(),
        conditions: [
          ['content-length-range', 0, 1048576000], // 文件大小限制
          ['starts-with', '$key', dir], // 上传目录限制
          { bucket: process.env.ALIYUN_OSS_BUCKET },
        ],
      };
  
      const formData = await this.minioClient.calculatePostSignature(policy);
  
      return {
        expire: moment(date).unix().toString(),
        policy: formData.policy,
        signature: formData.Signature,
        accessid: formData.OSSAccessKeyId,
        stsToken: this.minioClient.stsToken,
        host: `http://${process.env.ALIYUN_OSS_BUCKET}.${process.env.ALIYUN_OSS_REGION}.aliyuncs.com`,
        dir,
      };
    }
}