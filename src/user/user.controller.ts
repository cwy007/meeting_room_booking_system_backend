import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UnauthorizedException,
  DefaultValuePipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { UserDetailVo } from './vo/user-detail.vo';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { generateParseIntPipe } from 'src/utils';
// import { ApiTags } from '@nestjs/swagger'

// @ApiTags('用户管理模块')
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
    const code = Math.random().toString(36).substring(2, 8);
    console.log('请求注册验证码', email, code);

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
    console.log('登录请求', loginUserDto);
    const vo = await this.userService.login(loginUserDto);

    const { accessToken, refreshToken } =
      this.userService.getAccessAndRefreshToken(vo);
    vo.accessToken = accessToken;
    vo.refreshToken = refreshToken;

    return vo;
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUserDto: LoginUserDto) {
    console.log('登录请求', loginUserDto);
    const vo = await this.userService.login(loginUserDto, true);

    const { accessToken, refreshToken } =
      this.userService.getAccessAndRefreshToken(vo);
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

  @Get('update_password/captcha')
  async getUpdatePasswordCaptcha(@Query('email') email: string) {
    const code = Math.random().toString(36).substring(2, 8);
    console.log('请求修改密码验证码', email, code);

    await this.redisService.set(`update-password-captcha:${email}`, code, 600);

    await this.emailService.sendEmail(
      email,
      '会议室预订系统 - 修改密码验证码',
      `<p>您的验证码是：<b>${code}</b>，有效期10分钟</p>`,
    );

    return '验证码已发送';
  }

  @Post(['update_password', 'admin/update_password'])
  @RequireLogin()
  async updatePassword(
    @UserInfo('userId') userId: number,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    console.log('updateUserPasswordDto', updateUserPasswordDto);
    return await this.userService.updatePassword(userId, updateUserPasswordDto);
  }

  // 本地开发环境初始化数据
  // @Get('init-data')
  // async initData() {
  //   await this.userService.initData();
  //   return '初始化数据成功';
  // }

  @Get('update/captcha')
  async getUpdateCaptcha(@Query('email') email: string) {
    const code = Math.random().toString(36).substring(2, 8);
    console.log('请求修改信息验证码', email, code);

    await this.redisService.set(`update_user_captcha_${email}`, code, 600);

    await this.emailService.sendEmail(
      email,
      '会议室预订系统 - 修改信息验证码',
      `<p>您的验证码是：<b>${code}</b>，有效期10分钟</p>`,
    );

    return '验证码已发送';
  }

  @Post(['update', 'admin/update'])
  @RequireLogin()
  update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @Get('freeze')
  freezeUser(@Query('id', generateParseIntPipe('id')) id: number) {
    return this.userService.freezeUserById(id);
  }

  @Get('unfreeze')
  unfreezeUser(@Query('id', generateParseIntPipe('id')) id: number) {
    return this.userService.freezeUserById(id, false);
  }

  @Get('list')
  async list(
    @Query('page', new DefaultValuePipe(1), generateParseIntPipe('page'))
    page: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query('username') username: string,
    @Query('email') email: string,
    @Query('nickName') nickName: string,
  ) {
    return await this.userService.findUsers(
      page,
      pageSize,
      username,
      email,
      nickName,
    );
  }
}
