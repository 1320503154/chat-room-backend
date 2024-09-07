import { BadRequestException, Inject, Injectable } from '@nestjs/common'; // 导入必要的模块和装饰器
import { PrismaService } from 'src/prisma/prisma.service'; // 导入Prisma服务
import { Result } from 'src/utils/result'; // 导入Result工具类

@Injectable() // 标记为可注入的服务
export class ChatroomService {

    @Inject(PrismaService) // 注入Prisma服务
    private prismaService: PrismaService; // 定义Prisma服务实例

    // 创建一对一聊天室
    async createOneToOneChatroom(friendId: number, userId: number) {
        // 创建聊天室并获取聊天室ID
        const { id } = await this.prismaService.chatroom.create({
            data: {
                name: '聊天室' + Math.random().toString().slice(2, 8), // 随机生成聊天室名称
                type: false, // 设置聊天室类型为一对一
            },
            select: {
                id: true // 只选择ID字段
            }
        });

        // 将用户1加入聊天室
        await this.prismaService.userChatroom.create({
            data: {
                userId, // 用户ID
                chatroomId: id // 聊天室ID
            }
        });
        // 将用户2加入聊天室
        await this.prismaService.userChatroom.create({
            data: {
                userId: friendId, // 好友ID
                chatroomId: id // 聊天室ID
            }
        });
        return Result.success({"chatRoomId":id}, '创建一对一成功'); // 返回成功结果
    }

    // 创建群聊聊天室
    async createGroupChatroom(name: string, userId: number) {
        // 创建群聊并获取聊天室ID
        const { id } = await this.prismaService.chatroom.create({
            data: {
                name, // 群聊名称
                type: true // 设置聊天室类型为群聊
            }
        })
        // 将用户加入群聊
        await this.prismaService.userChatroom.create({
            data: {
                userId, // 用户ID
                chatroomId: id // 聊天室ID
            }
        });
        return Result.success({"chatRoomId":id}, '创建群聊成功'); // 返回成功结果
    }

    // 列出用户的聊天室
    async list(userId: number, name: string) {
        // 获取用户的所有聊天室ID
        const chatroomIds = await this.prismaService.userChatroom.findMany({
            where: {
                userId // 用户ID
            },
            select: {
                chatroomId: true // 只选择聊天室ID字段
            }
        })
        // 根据聊天室ID和名称查询聊天室
        const chatrooms = await this.prismaService.chatroom.findMany({
            where: {
                id: {
                    in: chatroomIds.map(item => item.chatroomId) // 聊天室ID在用户的聊天室ID列表中
                },
                name: {
                    contains: name // 聊天室名称包含指定名称
                }
            },
            select: {
                id: true, // 选择ID字段
                name: true, // 选择名称字段
                type: true, // 选择类型字段
                createTime: true // 选择创建时间字段
            }
        });

        const res = []; // 定义结果数组
        // 遍历聊天室
        for (let i = 0; i < chatrooms.length; i++) {
            // 获取聊天室的所有用户ID
            const userIds = await this.prismaService.userChatroom.findMany({
                where: {
                    chatroomId: chatrooms[i].id // 聊天室ID
                },
                select: {
                    userId: true // 只选择用户ID字段
                }
            })
            // 如果是单聊，获取另一个用户的信息
            if(chatrooms[i].type === false) {
                const user = await this.prismaService.user.findUnique({
                    where: {
                        id: userIds.filter(item => item.userId !== userId)[0].userId // 过滤出另一个用户的ID
                    }
                })
                chatrooms[i].name = user.nickName // 将聊天室名称设置为另一个用户的昵称
            }
            // 将聊天室信息和用户信息添加到结果数组
            res.push({
                ...chatrooms[i], // 聊天室信息
                userCount: userIds.length, // 用户数量
                userIds: userIds.map(item => item.userId) // 用户ID列表
            })
        }
        
        return Result.success(res); // 返回成功结果
    }

    // 获取聊天室成员
    async members(chatroomId: number) {
        // 获取聊天室的所有用户ID
        const userIds = await this.prismaService.userChatroom.findMany({
            where: {
                chatroomId // 聊天室ID
            },
            select: {
                userId: true // 只选择用户ID字段
            }
        })
        // 根据用户ID查询用户信息
        const users = await this.prismaService.user.findMany({
            where: {
                id: {
                    in: userIds.map(item => item.userId) // 用户ID在聊天室的用户ID列表中
                }
            },
            select: {
                id: true, // 选择ID字段
                username: true, // 选择用户名字段
                nickName: true, // 选择昵称字段
                headPic: true, // 选择头像字段
                createTime: true, // 选择创建时间字段
                email: true // 选择邮箱字段
            }
        });
        return Result.success(users); // 返回成功结果
    }

    // 获取聊天室信息
    async info(id: number) {
        // 根据ID查询聊天室信息
        const chatroom = await this.prismaService.chatroom.findUnique({
            where: {
                id // 聊天室ID
            }
        });
        return {...chatroom, users: await this.members(id)} // 返回聊天室信息和成员信息
    }

// 加入聊天室
async join(id: number, username: string) {
    // 根据ID查询聊天室信息
    const chatroom = await this.prismaService.chatroom.findUnique({
        where: {
            id // 聊天室ID
        }
    });

    // 如果是单聊，抛出异常
    if (chatroom.type === false) {
        throw new BadRequestException('一对一聊天室不能加人');
    }

    // 根据用户名查询用户信息
    const user = await this.prismaService.user.findUnique({
        where: {
            username // 用户名
        }
    });

    // 如果用户不存在，抛出异常
    if (!user) {
        throw new BadRequestException('用户不存在');
    }

    // 检查用户是否已经在聊天室中
    const existingRecord = await this.prismaService.userChatroom.findUnique({
        where: {
            userId_chatroomId: {
                userId: user.id,
                chatroomId: id,
            },
        },
    });

    // 如果记录已经存在，抛出异常或执行其他逻辑
    if (existingRecord) {
        throw new BadRequestException('用户已经在聊天室中');
    }

    // 将用户加入聊天室
    await this.prismaService.userChatroom.create({
        data: {
            userId: user.id, // 用户ID
            chatroomId: id // 聊天室ID
        }
    });

    return chatroom.id; // 返回聊天室ID
}

    // 退出聊天室
    async quit(id: number, userId: number) {
        // 根据ID查询聊天室信息
        const chatroom = await this.prismaService.chatroom.findUnique({
            where: {
                id // 聊天室ID
            }
        });
        // 如果是单聊，抛出异常
        if(chatroom.type === false) {
            throw new BadRequestException('一对一聊天室不能退出');
        }

        // 删除用户与聊天室的关联
        await this.prismaService.userChatroom.deleteMany({
            where: {
                userId, // 用户ID
                chatroomId: id // 聊天室ID
            }
        })

        return '退出成功'; // 返回成功消息
    }
    
    async queryOneToOneChatroom(userId1: number, userId2: number) {
        // 获取用户1的所有聊天室
        const chatrooms = await this.prismaService.userChatroom.findMany({
            where: {
                userId: userId1 // 条件：用户ID为userId1
            }
        })
        // 获取用户2的所有聊天室
        const chatrooms2 = await this.prismaService.userChatroom.findMany({
            where: {
                userId: userId2 // 条件：用户ID为userId2
            }
        })
    
        let res; // 定义结果变量
        // 遍历用户1的聊天室
        for(let i = 0; i < chatrooms.length; i++) {
            // 查找聊天室详细信息
            const chatroom = await this.prismaService.chatroom.findFirst({
                where: {
                    id: chatrooms[i].chatroomId // 条件：聊天室ID为当前遍历的聊天室ID
                }
            })
            // 如果聊天室类型为true，跳过当前循环
            if(chatroom.type === true) {
                continue;
            }
    
            // 在用户2的聊天室中查找是否有相同的聊天室ID
            const found = chatrooms2.find(item2 => item2.chatroomId === chatroom.id)
            // 如果找到了相同的聊天室ID
            if(found) {
                res = found.chatroomId // 将结果设置为找到的聊天室ID
                break; // 退出循环
            }
        }
        if(res===undefined) {
            // 如果结果为undefined，返回错误信息
            return Result.error('没有找到一对一聊天室');
        }
        return res // 返回结果
    }
}
