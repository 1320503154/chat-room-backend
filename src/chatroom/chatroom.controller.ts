import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiTags } from '@nestjs/swagger';
import { ChatroomService } from './chatroom.service';
import { RequireLogin, UserInfo } from 'src/custom.decorator';

@ApiTags('chatroom')
@Controller('chatroom')
@RequireLogin()
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @ApiOperation({ summary: '创建一对一聊天' })
  @ApiQuery({ name: 'friendId', type: Number, description: '好友ID', required: true })
  @ApiResponse({ status: 200, description: '成功创建一对一聊天' })
  @Get('create-one-to-one')
  async oneToOne(@Query('friendId') friendId: number, @UserInfo('userId') userId: number) {
    if (!friendId) {
      throw new BadRequestException('聊天好友的 id 不能为空');
    }
    return this.chatroomService.createOneToOneChatroom(friendId, userId);
  }

  @ApiOperation({ summary: '创建群聊' })
  @ApiQuery({ name: 'name', type: String, description: '群聊名称', required: true })
  @ApiResponse({ status: 200, description: '成功创建群聊' })
  @Get('create-group')
  async group(@Query('name') name: string, @UserInfo('userId') userId: number) {
    return this.chatroomService.createGroupChatroom(name, userId);
  }

  @ApiOperation({ summary: '获取聊天列表' })
  @ApiQuery({ name: 'name', type: String, description: '聊天名称', required: false })
  @ApiResponse({ status: 200, description: '成功获取聊天列表' })
  @Get('list')
  async list(@UserInfo('userId') userId: number, @Query('name') name: string) {
    if (!userId) {
      throw new BadRequestException('userId 不能为空');
    }
    return this.chatroomService.list(userId, name);
  }

  @ApiOperation({ summary: '获取聊天成员' })
  @ApiQuery({ name: 'chatroomId', type: Number, description: '聊天ID', required: true })
  @ApiResponse({ status: 200, description: '成功获取聊天成员' })
  @Get('members')
  async members(@Query('chatroomId') chatroomId: number) {
    if (!chatroomId) {
      throw new BadRequestException('chatroomId 不能为空');
    }
    return this.chatroomService.members(chatroomId);
  }

  @ApiOperation({ summary: '获取聊天信息' })
  @ApiParam({ name: 'id', type: Number, description: '聊天ID', required: true })
  @ApiResponse({ status: 200, description: '成功获取聊天信息' })
  @Get('info/:id')
  async info(@Param('id') id: number) {
    if (!id) {
      throw new BadRequestException('id 不能为空');
    }
    return this.chatroomService.info(id);
  }

  @ApiOperation({ summary: '加入聊天' })
  @ApiParam({ name: 'id', type: Number, description: '聊天ID', required: true })
  @ApiQuery({ name: 'joinUsername', type: String, description: '加入用户名', required: true })
  @ApiResponse({ status: 200, description: '成功加入聊天' })
  @Get('join/:id')
  async join(@Param('id') id: number, @Query('joinUsername') joinUsername: string) {
    if (!id) {
      throw new BadRequestException('id 不能为空');
    }
    if (!joinUsername) {
      throw new BadRequestException('joinUsername 不能为空');
    }
    return this.chatroomService.join(id, joinUsername);
  }

  @ApiOperation({ summary: '退出聊天' })
  @ApiParam({ name: 'id', type: Number, description: '聊天ID', required: true })
  @ApiQuery({ name: 'quitUserId', type: Number, description: '退出用户ID', required: true })
  @ApiResponse({ status: 200, description: '成功退出聊天' })
  @Get('quit/:id')
  async quit(@Param('id') id: number, @Query('quitUserId') quitUserId: number) {
    if (!id) {
      throw new BadRequestException('id 不能为空');
    }
    if (!quitUserId) {
      throw new BadRequestException('quitUserId 不能为空');
    }
    return this.chatroomService.quit(id, quitUserId);
  }

  @ApiOperation({ summary: '查找一对一聊天' })
  @ApiQuery({ name: 'userId1', type: String, description: '用户1 ID', required: true })
  @ApiQuery({ name: 'userId2', type: String, description: '用户2 ID', required: true })
  @ApiResponse({ status: 200, description: '成功查找一对一聊天' })
  @Get('findChatroom')
  async findChatroom(@Query('userId1') userId1: string, @Query('userId2') userId2: string) {
    if (!userId1 || !userId2) {
      throw new BadRequestException('用户 id 不能为空');
    }
    return this.chatroomService.queryOneToOneChatroom(+userId1, +userId2);
  }
}