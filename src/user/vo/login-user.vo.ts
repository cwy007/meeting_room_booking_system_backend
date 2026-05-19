import { ApiProperty } from "@nestjs/swagger";

class UserInfo {
  @ApiProperty({ description: '用户ID' })
  id: number;

  @ApiProperty({ description: '用户名' })
  username: string;

  @ApiProperty({ description: '昵称' })
  nickName: string;

  @ApiProperty({ description: '邮箱' })
  email: string;

  @ApiProperty({ description: '头像' })
  headPic: string;

  @ApiProperty({ description: '手机号' })
  phoneNumber: string;

  @ApiProperty({ description: '是否被冻结' })
  isFrozen: boolean;

  @ApiProperty({ description: '是否是管理员' })
  isAdmin: boolean;

  @ApiProperty({ description: '创建时间' })
  createTime: number;

  @ApiProperty({ example: ['管理员'] })
  roles: string[];

  @ApiProperty({
    example: [{
      id: 1,
      code: 'query_aaa',
      description: 'aaa读取权限'
    }]
  })
  permissions: {
    id: number;
    code: string;
    description: string;
  }[];

  @ApiProperty({ description: '登录类型: 0-用户名密码登录，1-Google登录，2-GitHub登录' })
  loginType: number;
}

export class LoginUserVo {
  @ApiProperty({ description: '用户信息' })
  userInfo: UserInfo;

  @ApiProperty({ description: '鉴权token' })
  accessToken: string;

  @ApiProperty({ description: '刷新token' })
  refreshToken: string;
}