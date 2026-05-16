import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UnauthorizedException,
  DefaultValuePipe,
  HttpStatus,
  HttpCode,
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
import { ApiBearerAuth, ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { LoginUserVo } from './vo/login-user.vo';
import { RefreshTokenVo } from './vo/refresh-token.vo';
import { UserListVo } from './vo/user-list.vo';

@ApiTags('用户管理模块')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱地址',
    required: true,
    example: "chanweiyan007@gmail.com"
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码已发送',
    type: String,
  })
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

  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '注册成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '用户保存失败',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码错误/用户名已存在',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    console.log(registerUserDto);
    return this.userService.register(registerUserDto);
  }

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 accessToken, refreshToken',
    type: LoginUserVo,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
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

  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息和 accessToken, refreshToken',
    type: LoginUserVo,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在/密码错误',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
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

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxx.yyyyy.zzzz',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(payload.userId);

      return this.userService.getAccessAndRefreshToken(user);
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @ApiQuery({
    name: 'refreshToken',
    type: String,
    description: '刷新 token',
    required: true,
    example: 'xxxx.yyyyy.zzzz',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '刷新成功',
    type: RefreshTokenVo,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'token 已失效，请重新登录',
  })
  @Get('admin/refresh')
  @HttpCode(HttpStatus.OK)
  async adminRefreshToken(@Query('refreshToken') refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findUserById(payload.userId, true);

      return this.userService.getAccessAndRefreshToken(user);
    } catch (error) {
      throw new UnauthorizedException('token 已失效，请重新登录');
    }
  }

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息',
    type: UserDetailVo,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '用户不存在',
  })
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

  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱地址',
    required: true,
    example: "example@example.com",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码已发送',
    type: String,
  })
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

  @ApiBody({ type: UpdateUserPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '密码更新成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码错误/用户不存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '密码更新失败',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Post(['update_password', 'admin/update_password'])
  async updatePassword(
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    console.log('updateUserPasswordDto', updateUserPasswordDto);
    return await this.userService.updatePassword(updateUserPasswordDto);
  }

  // 本地开发环境初始化数据
  // @Get('init-data')
  // async initData() {
  //   await this.userService.initData();
  //   return '初始化数据成功';
  // }

  @ApiResponse({
    status: HttpStatus.OK,
    description: '验证码已发送',
    type: String,
  })
  @Get('update/captcha')
  @RequireLogin()
  async getUpdateCaptcha(@UserInfo('email') email: string) {
    const code = Math.random().toString(36).substring(2, 8);

    await this.redisService.set(`update_user_captcha_${email}`, code, 600);

    await this.emailService.sendEmail(
      email,
      '会议室预订系统 - 修改信息验证码',
      `<p>您的验证码是：<b>${code}</b>，有效期10分钟</p>`,
    );

    console.log('请求修改信息验证码', email, code);
    return '验证码已发送';
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户信息更新成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '验证码已失效/验证码错误/用户不存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '用户信息更新失败',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Post(['update', 'admin/update'])
  @RequireLogin()
  update(
    @UserInfo('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(userId, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    type: Number,
    description: '用户ID',
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户冻结/解冻成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '用户冻结/解冻失败',
    type: String,
  })
  @Get('freeze')
  freezeUser(@Query('id', generateParseIntPipe('id')) id: number) {
    return this.userService.freezeUserById(id);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'id',
    type: Number,
    description: '用户ID',
    required: true,
    example: 1,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户冻结/解冻成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '用户不存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '用户冻结/解冻失败',
    type: String,
  })
  @Get('unfreeze')
  unfreezeUser(@Query('id', generateParseIntPipe('id')) id: number) {
    return this.userService.freezeUserById(id, false);
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: 'page',
    type: Number,
    description: '页码',
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    description: '每页条数',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'username',
    type: String,
    description: '用户名（模糊查询）',
    required: false,
    example: 'chan',
  })
  @ApiQuery({
    name: 'email',
    type: String,
    description: '邮箱地址（模糊查询）',
    required: false,
    example: 'example@example.com',
  })
  @ApiQuery({
    name: 'nickName',
    type: String,
    description: '昵称（模糊查询）',
    required: false,
    example: 'chan',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '用户列表',
    type: UserListVo,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '查询用户列表失败',
    type: String,
  })
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
