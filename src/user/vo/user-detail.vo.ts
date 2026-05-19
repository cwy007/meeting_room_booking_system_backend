import { ApiProperty } from "@nestjs/swagger";

export class UserDetailVo {
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

  @ApiProperty({ description: '创建时间' })
  createTime: number;

  @ApiProperty({ description: '登录类型: 0-用户名密码登录，1-Google登录，2-GitHub登录' })
  loginType: number;
}