import { applyIsOptionalDecorator } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @ApiPropertyOptional()
  @ApiProperty()
  @IsNotEmpty({ message: '昵称不能为空' })
  nickName: string;

  @ApiProperty({ minLength: 6 })
  @IsNotEmpty({ message: '密码不能为空' })
  @MinLength(6, {
    message: '密码长度不能小于6位',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: '验证码不能为空' })
  captcha: string;
}
