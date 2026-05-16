import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenVo {
  @ApiProperty({ description: '新的鉴权token' })
  accessToken: string;

  @ApiProperty({ description: '新的刷新token' })
  refreshToken: string;
}