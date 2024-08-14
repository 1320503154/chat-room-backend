import { Controller, Get, Query, Res } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('chat-history')
@Controller('chat-history')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  @ApiOperation({ summary: '获取聊天记录列表' })
  @ApiQuery({ name: 'chatroomId', type: String, description: '聊天室ID', required: true })
  @ApiResponse({ status: 200, description: '成功获取聊天记录列表' })
  @Get('list')
  async list(@Query('chatroomId') chatroomId: string) {
    return this.chatHistoryService.list(+chatroomId);
  }
}