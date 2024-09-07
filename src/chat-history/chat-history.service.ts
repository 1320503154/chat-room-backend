import { Inject, Injectable } from '@nestjs/common'; // 导入必要的模块和装饰器
import { ChatHistory } from '@prisma/client'; // 导入ChatHistory类型
import { PrismaService } from 'src/prisma/prisma.service'; // 导入Prisma服务

// 定义HistoryDto类型，包含ChatHistory的部分字段
export type HistoryDto = Pick<ChatHistory, 'chatroomId' | 'senderId' | 'type' | 'content'>;

@Injectable() // 标记为可注入的服务
export class ChatHistoryService {
    @Inject(PrismaService) // 注入Prisma服务
    private prismaService: PrismaService; // 定义Prisma服务实例

    // 获取指定聊天室的聊天记录
    async list(chatroomId: number) {
        // 查询指定聊天室的所有聊天记录
        const history = await this.prismaService.chatHistory.findMany({
            where: {
                chatroomId // 聊天室ID
            }
        });

        const res = []; // 定义结果数组
        // 遍历聊天记录
        for(let i = 0; i < history.length; i++) {
            // 查询发送者的用户信息
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: history[i].senderId // 发送者ID
                },
                select: {
                    id: true, // 选择ID字段
                    username: true, // 选择用户名字段
                    nickName: true, // 选择昵称字段
                    email: true, // 选择邮箱字段
                    createTime: true, // 选择创建时间字段
                    headPic: true // 选择头像字段
                }
            });
            // 将聊天记录和发送者信息添加到结果数组
            res.push({
                ...history[i], // 聊天记录
                sender: user // 发送者信息
            });
        }
        return res; // 返回结果数组
    }

    // 添加新的聊天记录
    async add(chatroomId: number, history: HistoryDto) {
        // 创建新的聊天记录
        return this.prismaService.chatHistory.create({
            data: history // 聊天记录数据
        });
    }

}