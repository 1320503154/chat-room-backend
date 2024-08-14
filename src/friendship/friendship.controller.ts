import { BadRequestException, Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { FriendshipService } from './friendship.service';
import { FriendAddDto } from './dto/friend-add.dto';
import { RequireLogin, UserInfo } from 'src/custom.decorator';

@ApiTags('friendship')
@Controller('friendship')
@RequireLogin()
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Post('add')
  @ApiOperation({ summary: '添加好友' })
  @ApiBody({ type: FriendAddDto })
  async add(@Body() friendAddDto: FriendAddDto, @UserInfo("userId") userId: number) {
    return this.friendshipService.add(friendAddDto, userId);
  }

  @Get('request_list')
  @ApiOperation({ summary: '获取好友请求列表' })
  async list(@UserInfo("userId") userId: number) {
    return this.friendshipService.list(userId);
  }

  @Get('agree/:id')
  @ApiOperation({ summary: '同意好友请求' })
  @ApiParam({ name: 'id', description: '好友请求ID' })
  async agree(@Param('id') friendId: number, @UserInfo("userId") userId: number) {
    if(!friendId) {
      throw new BadRequestException('添加的好友 id 不能为空');
    }
    return this.friendshipService.agree(friendId, userId);
  }

  @Get('reject/:id')
  @ApiOperation({ summary: '拒绝好友请求' })
  @ApiParam({ name: 'id', description: '好友请求ID' })
  async reject(@Param('id') friendId: number, @UserInfo("userId") userId: number) {
    if(!friendId) {
      throw new BadRequestException('添加的好友 id 不能为空');
    }
    return this.friendshipService.reject(friendId, userId);
  }

  @Get('list')
  @ApiOperation({ summary: '获取好友列表' })
  @ApiQuery({ name: 'name', required: false, description: '好友名称' })
  async friendship(@UserInfo('userId') userId: number, @Query('name') name: string) {
    return this.friendshipService.getFriendship(userId, name);
  }

  @Get('remove/:id')
  @ApiOperation({ summary: '删除好友' })
  @ApiParam({ name: 'id', description: '好友ID' })
  async remove(@Param('id') friendId: number, @UserInfo('userId') userId: number) {
    return this.friendshipService.remove(friendId, userId);
  }
}