import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '1561931060@qq.com',
        pass: 'cnwobnqyvsrbgjfa',
      },
    })
  }

  async sendEmail(to: string, subject: string, html: string) {
    if (!to) {
      throw new HttpException('收件人邮箱不能为空', HttpStatus.BAD_REQUEST);
    }
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: '1561931060@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
