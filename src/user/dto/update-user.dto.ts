import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @ApiProperty({ description: '头像' })
  headPic: string;

  @ApiPropertyOptional()
  @ApiProperty({ description: '昵称' })
  nickName: string;

  @ApiProperty({ description: '邮箱地址' })
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '验证码' })
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
