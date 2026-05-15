import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  transporter: Transporter;
  ;

  constructor(private readonly configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get<string>('nodemailer_host'),
      port: this.configService.get<number>('nodemailer_port'),
      secure: false,
      auth: {
        user: this.configService.get<string>('nodemailer_auth_user'),
        pass: this.configService.get<string>('nodemailer_auth_pass'),
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
        address: this.configService.get<string>('nodemailer_auth_user')!,
      },
      to,
      subject,
      html,
    });
  }
}
