import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateBookingDto {
  @IsNotEmpty({ message: '会议室ID不能为空' })
  @IsNumber({}, { message: '会议室ID必须是数字' })
  meetingRoomId: number;

  @IsNotEmpty({ message: '开始时间不能为空' })
  @IsNumber({}, { message: '开始时间必须是数字' })
  startTime: number;

  @IsNotEmpty({ message: '结束时间不能为空' })
  @IsNumber({}, { message: '结束时间必须是数字' })
  endTime: number;

  note: string;
}
