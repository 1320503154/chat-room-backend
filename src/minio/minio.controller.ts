import { Controller, Get, Inject, Query } from '@nestjs/common';
import * as Minio from 'minio';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('minio')
@Controller('minio')
export class MinioController {

    @Inject('MINIO_CLIENT')
    private minioClient: Minio.Client;

    @Get('presignedUrl')
    @ApiOperation({ summary: '获取预签名的上传URL' })
    @ApiQuery({ name: 'name', required: true, description: '对象名称' })
    presignedPutObject(@Query('name') name: string) {
        return this.minioClient.presignedPutObject('chat-room', name, 3600);
    }
}