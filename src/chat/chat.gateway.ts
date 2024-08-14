import { UserService } from './../user/user.service'; // 导入用户服务
import { ChatHistory } from '@prisma/client'; // 导入聊天历史模型
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'; // 导入WebSocket相关装饰器和类
import { ChatService } from './chat.service'; // 导入聊天服务
import { Server, Socket } from 'socket.io'; // 导入Socket.IO的Server和Socket类
import { ChatHistoryService } from 'src/chat-history/chat-history.service'; // 导入聊天历史服务
import { Inject } from '@nestjs/common'; // 导入依赖注入装饰器

// 定义加入房间的有效载荷接口
interface JoinRoomPayload {
  chatroomId: number // 聊天房间ID
  userId: number // 用户ID
}

// 定义发送消息的有效载荷接口
interface SendMessagePayload {
  sendUserId: number; // 发送用户ID
  chatroomId: number; // 聊天房间ID
  message: { // 消息内容
    type: 'text' | 'image' | 'file', // 消息类型
    content: string // 消息内容
  }
}

@WebSocketGateway({cors: { origin: '*' }}) // WebSocket网关装饰器，允许跨域
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {} // 构造函数，注入聊天服务

  @WebSocketServer() server: Server; // WebSocket服务器实例

  @SubscribeMessage('joinRoom') // 订阅'joinRoom'消息
  joinRoom(client: Socket, payload: JoinRoomPayload): void { // 加入房间方法
    const roomName = payload.chatroomId.toString(); // 将房间ID转换为字符串

    client.join(roomName) // 客户端加入指定房间

    this.server.to(roomName).emit('message', { // 向房间广播消息
      type: 'joinRoom', // 消息类型
      userId: payload.userId // 用户ID
    });
  }

  @Inject(ChatHistoryService) // 注入聊天历史服务
  private chatHistoryService: ChatHistoryService // 聊天历史服务实例

  @Inject(UserService) // 注入用户服务
  private userService: UserService // 用户服务实例
  
  @SubscribeMessage('sendMessage') // 订阅'sendMessage'消息
  async sendMessage(@MessageBody() payload: SendMessagePayload) { // 发送消息方法
    const roomName = payload.chatroomId.toString(); // 将房间ID转换为字符串

    const map = { // 消息类型映射
      text: 0, // 文本类型
      image: 1, // 图片类型
      file: 2 // 文件类型
    }
    const history = await this.chatHistoryService.add(payload.chatroomId, { // 添加聊天记录
      content: payload.message.content, // 消息内容
      type: map[payload.message.type], // 消息类型
      chatroomId: payload.chatroomId, // 聊天房间ID
      senderId: payload.sendUserId // 发送者ID
    });
    const sender = await this.userService.findUserDetailById(history.senderId); // 查找发送者详细信息

    this.server.to(roomName).emit('message', { // 向房间广播发送的消息
      type: 'sendMessage', // 消息类型
      userId: payload.sendUserId, // 发送用户ID
      message: { // 消息内容
        ...history, // 聊天记录
        sender // 发送者信息
      }
    });
  }
}