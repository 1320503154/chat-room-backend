import { Injectable } from '@nestjs/common';
import { createTransport, Transporter} from 'nodemailer';
//导入环境变量模块
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class EmailService {

  transporter: Transporter
  
  constructor() {
    // 创建一个邮件传输器
    this.transporter = createTransport({
      host: process.env.EMAIL_HOST, // 邮件服务器地址
      port: process.env.EMAIL_PORT, // 邮件服务器端口
      secure: true, // 是否使用安全连接
      auth: {
        user: process.env.EMAIL_USER, // 发送邮件的邮箱地址
        pass: process.env.EMAIL_AUTHORIZATION_CODE // 发送邮件的邮箱密码
      },
    });
  }

  async sendMail({ to, subject, html }) {
    // 发送邮件
    await this.transporter.sendMail({
    from: {
      name: '在线聊天室', // 发件人名称
      address: process.env.EMAIL_USER // 发件人邮箱地址
    },
    to, // 收件人邮箱地址
    subject, // 邮件主题
    html // 邮件内容
    });
  }
}
