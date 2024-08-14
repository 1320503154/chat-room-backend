import { FriendAddDto } from './dto/friend-add.dto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendshipService {

    @Inject(PrismaService)
    private prismaService: PrismaService;

    async add(friendAddDto: FriendAddDto, userId: number) {
        const friend = await this.prismaService.user.findUnique({
            where: {
                username: friendAddDto.username
            }
        });

        if(!friend) {
            throw new BadRequestException('要添加的 username 不存在');
        }

        if(friend.id === userId) {
            throw new BadRequestException('不能添加自己为好友');
        }

        const found = await this.prismaService.friendship.findMany({
            where: {
                userId,
                friendId: friend.id
            }
        })

        if(found.length) {
            throw new BadRequestException('该好友已经添加过');
        }
    
        return await this.prismaService.friendRequest.create({
            data: {
                fromUserId: userId,
                toUserId: friend.id,
                reason: friendAddDto.reason,
                status: 0
            }
        })
    }

    async list(userId: number) {
        const fromMeRequest = await this.prismaService.friendRequest.findMany({
            where: {
                fromUserId: userId
            }
        })

        const toMeRequest =  await this.prismaService.friendRequest.findMany({
            where: {
                toUserId: userId
            }
        })

        const res = {
            toMe: [],
            fromMe: []
        }

        for (let i = 0; i < fromMeRequest.length; i++) {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: fromMeRequest[i].toUserId
                },
                select: {
                    id: true,
                    username: true,
                    nickName: true,
                    email: true,
                    headPic: true,
                    createTime: true
                }
            })
            res.fromMe.push({
                ...fromMeRequest[i],
                toUser: user
            })
        }

        for (let i = 0; i < toMeRequest.length; i++) {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: toMeRequest[i].fromUserId
                },
                select: {
                    id: true,
                    username: true,
                    nickName: true,
                    email: true,
                    headPic: true,
                    createTime: true
                }
            })
            res.toMe.push({
                ...toMeRequest[i],
                fromUser: user
            })
        }

        return res;
    }

    async agree(friendId: number, userId: number) {
        await this.prismaService.friendRequest.updateMany({
            where: {
                fromUserId: friendId,
                toUserId: userId,
                status: 0
            },
            data: {
                status: 1
            }
        })

        const res = await this.prismaService.friendship.findMany({
            where: {
                userId,
                friendId
            }
        })

        if(!res.length) {
            await this.prismaService.friendship.create({
                data: {
                    userId,
                    friendId
                }
            })
        }
        return '添加成功'
    }

    async reject(friendId: number, userId: number) {
        await this.prismaService.friendRequest.updateMany({
            where: {
                fromUserId: friendId,
                toUserId: userId,
                status: 0
            },
            data: {
                status: 2
            }
        })
        return '已拒绝'
    }

   // 定义服务文件名为 friendship.service.ts
   async getFriendship(userId: number, name: string) {
           // 从数据库中查找与用户相关的所有好友关系
           const friends = await this.prismaService.friendship.findMany({
               where: {
                   OR: [
                       {
                           userId: userId // 查找用户为当前用户的好友关系
                       },
                       {
                           friendId: userId // 查找当前用户为好友的关系
                       }
                   ] 
               }
           });
   
           // 创建一个集合用于存储唯一的好友ID
           const set = new Set<number>();
           for(let i =0; i< friends.length; i++) {
               set.add(friends[i].userId) // 添加用户ID到集合
               set.add(friends[i].friendId) // 添加好友ID到集合
           }
   
           // 过滤掉当前用户ID，得到好友ID数组
           const friendIds = [...set].filter(item => item !== userId);
   
           // 初始化结果数组
           const res = [];
   
           // 遍历好友ID，查找每个好友的详细信息
           for(let i = 0; i< friendIds.length; i++) {
               const user = await this.prismaService.user.findUnique({
                   where: {
                     id: friendIds[i], // 根据好友ID查找用户
                   },
                   select: {
                     id: true, // 选择返回用户ID
                     username: true, // 选择返回用户名
                     nickName: true, // 选择返回昵称
                     email: true // 选择返回邮箱
                   }
               })
               res.push(user) // 将用户信息推入结果数组
           }
   
           // 返回昵称包含指定名称的用户信息
           return res.filter((item: User) => item.nickName.includes(name))
       }
   
       // 定义删除好友关系的方法
       async remove(friendId: number, userId: number) {
           // 从数据库中删除指定的好友关系
           await this.prismaService.friendship.deleteMany({
               where: {
                   userId, // 指定用户ID
                   friendId, // 指定好友ID
               }
           })
           return '删除成功'; // 返回删除成功的消息
       }
   }