import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { md5 } from 'src/utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';

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

  async register(registerUserDto: RegisterUserDto) {
    const captcha = await this.redisService.get(`captcha:${registerUserDto.email}`);

    if (!captcha) {
      throw new HttpException('验证码已失效', HttpStatus.BAD_REQUEST);
    }

    if (captcha !== registerUserDto.captcha) {
      throw new HttpException('验证码错误', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOneBy({ username: registerUserDto.username });
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

  async initData() {
    const user1 = new User();
    user1.username = "zhangsan";
    user1.password = md5("111111");
    user1.email = "xxx@xx.com";
    user1.isAdmin = true;
    user1.nickName = '张三';
    user1.phoneNumber = '13233323333';

    const user2 = new User();
    user2.username = 'lisi';
    user2.password = md5("222222");
    user2.email = "yy@yy.com";
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
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
