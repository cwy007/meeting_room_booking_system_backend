import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
  ) { }

  @Get('register-captcha')
  async getRegisterCaptcha(@Query('email') email: string) {
    console.log('请求注册验证码', email);
    const code = Math.random().toString(36).substring(2, 8);

    await this.redisService.set(`captcha:${email}`, code, 300);

    await this.emailService.sendEmail(
      email,
      '会议室预订系统 - 注册验证码',
      `<p>您的验证码是：<b>${code}</b>，有效期5分钟</p>`,
    );

    return '验证码已发送';
  }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    console.log(registerUserDto);
    return this.userService.register(registerUserDto);
  }

  @Get('init-data')
  async initData() {
    await this.userService.initData();
    return '初始化数据成功';
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
