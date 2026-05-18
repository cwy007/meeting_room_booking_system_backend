import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateBookingDto {
  /** 会议室 ID */
  @IsNotEmpty({ message: '会议室ID不能为空' })
  @IsNumber({}, { message: '会议室ID必须是数字' })
  meetingRoomId: number;

  /** 预订开始时间（时间戳，毫秒） */
  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsNumber({}, { message: '开始时间必须是数字' })
  startTime: number;

  /** 预订结束时间（时间戳，毫秒） */
  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsNumber({}, { message: '结束时间必须是数字' })
  endTime: number;

  /** 备注 */
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  note: string;
}
