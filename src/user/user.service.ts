import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { md5 } from 'src/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  @InjectRepository(User)
  private userRepository: Repository<User>;

  @InjectRepository(Role)
  private roleRepository: Repository<Role>;

  @InjectRepository(Permission)
  private permissionRepository: Repository<Permission>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  async register(registerUserDto: RegisterUserDto) {
    const captcha = await this.redisService.get(
      `captcha:${registerUserDto.email}`,
    );

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (captcha !== registerUserDto.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOneBy({
      username: registerUserDto.username,
    });
    if (user) {
      throw new HttpException('用户名已存在', HttpStatus.BAD_REQUEST);
    }

    // const emailUser = await this.userRepository.findOneBy({ email: registerUserDto.email });
    // if (emailUser) {
    //   throw new HttpException('邮箱已存在', HttpStatus.BAD_REQUEST);
    // }

    const newUser = new User();
    newUser.username = registerUserDto.username;
    newUser.password = md5(registerUserDto.password);
    newUser.nickName = registerUserDto.nickName;
    newUser.email = registerUserDto.email;

    try {
      await this.userRepository.save(newUser);
      await this.redisService.set(`captcha:${registerUserDto.email}`, '', 0);
      return '注册成功';
    } catch (error) {
      this.logger.error('注册失败', error.stack);
      throw new HttpException('注册失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(loginUserDto: LoginUserDto, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: { username: loginUserDto.username, isAdmin },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }

    return this.getLoginUserVo(user);
  }

  async initData() {
    const user1 = new User();
    user1.username = 'zhangsan';
    user1.password = md5('111111');
    user1.email = 'xxx@xx.com';
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5('222222');
    user2.email = 'yy@yy.com';
    user2.nickName = '李四';

    const role1 = new Role();
    role1.name = '管理员';

    const role2 = new Role();
    role2.name = '普通用户';

    const permission1 = new Permission();
    permission1.code = 'ccc';
    permission1.description = '访问 ccc 接口';

    const permission2 = new Permission();
    permission2.code = 'ddd';
    permission2.description = '访问 ddd 接口';

    user1.roles = [role1];
    user2.roles = [role2];

    role1.permissions = [permission1, permission2];
    role2.permissions = [permission1];

    await this.permissionRepository.save([permission1, permission2]);
    await this.roleRepository.save([role1, role2]);
    await this.userRepository.save([user1, user2]);
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return this.userRepository.findOneBy({ id });
  }

  async findUserById(userId: number, isAdmin = false) {
    const user = await this.userRepository.findOne({
      where: { id: userId, isAdmin },
      relations: ['roles', 'roles.permissions'],
    });

    return this.getLoginUserVo(user!);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  getLoginUserVo(user: User) {
    const vo = new LoginUserVo();
    vo.userInfo = {
      id: user.id,
      username: user.username,
      nickName: user.nickName,
      email: user.email,
      headPic: user.headPic,
      phoneNumber: user.phoneNumber,
      isFrozen: user.isFrozen,
      isAdmin: user.isAdmin,
      createTime: user.createTime.valueOf(),
      roles: user.roles.map((role) => role.name),
      // unique permissions by id
      permissions: Array.from(
        new Map(
          user.roles
            .flatMap((role) => role.permissions)
            .map((permission) => [permission.id, {
              id: permission.id,
              code: permission.code,
              description: permission.description,
            }]),
        ).values(),
      ),
    };

    return vo;
  }

  getAccessAndRefreshToken(userVo: LoginUserVo) {
    const accessToken = this.jwtService.sign({
      userId: userVo.userInfo.id,
      username: userVo.userInfo.username,
      roles: userVo.userInfo.roles,
      permissions: userVo.userInfo.permissions,
    }, {
      expiresIn: (this.configService.get<string>('jwt_access_token_expiration') || '30m') as '30m',
    });
    const refreshToken = this.jwtService.sign({
      userId: userVo.userInfo.id,
    }, {
      expiresIn: (this.configService.get<string>('jwt_refresh_token_expiration') || '7d') as '7d',
    });

    return { accessToken, refreshToken };
  }
}
