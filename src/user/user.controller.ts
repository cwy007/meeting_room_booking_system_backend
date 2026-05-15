import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UserDetailVo } from './vo/user-detail.vo';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log('登录请求', loginUserDto)
    const vo = await this.userService.login(loginUserDto);

    const { accessToken, refreshToken } = this.userService.getAccessAndRefreshToken(vo);
    vo.accessToken = accessToken;
    vo.refreshToken = refreshToken;

    return vo;
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUserDto: LoginUserDto) {
    console.log('登录请求', loginUserDto)
    const vo = await this.userService.login(loginUserDto, true);

    const { accessToken, refreshToken } = this.userService.getAccessAndRefreshToken(vo);
    vo.accessToken = accessToken;
    vo.refreshToken = refreshToken;


    return vo;
  }

  @Get('refresh')
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(payload.userId);

      return this.userService.getAccessAndRefreshToken(user);
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('admin/refresh')
  async adminRefreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(payload.userId, true);

      return this.userService.getAccessAndRefreshToken(user);
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @Get('info')
  @RequireLogin()
  async info(@UserInfo('userId') userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const vo = new UserDetailVo();
    vo.id = user.id;
    vo.username = user.username;
    vo.nickName = user.nickName;
    vo.email = user.email;
    vo.headPic = user.headPic;
    vo.phoneNumber = user.phoneNumber;
    vo.isFrozen = user.isFrozen;
    vo.createTime = user.createTime.getTime();

    return vo;
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
