import { Controller, Get, Post, Body, Param, Query, DefaultValuePipe, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { generateParseIntPipe } from 'src/utils';
import { RequireLogin, UserInfo } from 'src/custom.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Booking } from './entities/booking.entity';

@ApiTags('预订管理')
@ApiBearerAuth()
@RequireLogin()
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @ApiOperation({ summary: '新增预订' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '预订成功',
    type: Booking,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室不存在 / 用户不存在 / 该时间段已被预订',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Post('add')
  add(@Body() createBookingDto: CreateBookingDto, @UserInfo('userId') userId: number) {
    return this.bookingService.add(createBookingDto, userId);
  }

  @ApiOperation({ summary: '获取预订列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取预订列表成功',
    schema: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: { $ref: getSchemaPath(Booking) },
          description: '预订列表',
        },
        totalCount: {
          type: 'number',
          description: '预订总数量',
        },
      },
    },
  })
  @Get('list')
  findAll(
    @Query('page', generateParseIntPipe('page'), new DefaultValuePipe(1)) page: number,
    @Query('pageSize', generateParseIntPipe('pageSize'), new DefaultValuePipe(10)) pageSize: number,
    @Query('username') username: string,
    @Query('roomName') roomName: string,
    @Query('roomLocation') roomLocation: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number,
  ) {
    return this.bookingService.findAll(page, pageSize, username, roomName, roomLocation, bookingTimeRangeStart, bookingTimeRangeEnd);
  }

  @ApiOperation({ summary: '审批通过预订' })
  @ApiResponse({ status: HttpStatus.OK, description: '审批通过成功', type: Number })
  @Get('approve/:id')
  approve(@Param('id') id: string) {
    return this.bookingService.approve(+id);
  }

  @ApiOperation({ summary: '审批驳回预订' })
  @ApiResponse({ status: HttpStatus.OK, description: '审批驳回成功', type: Number })
  @Get('reject/:id')
  reject(@Param('id') id: string) {
    return this.bookingService.reject(+id);
  }

  @ApiOperation({ summary: '解除预订' })
  @ApiResponse({ status: HttpStatus.OK, description: '解除预订成功', type: Number })
  @Get('release/:id')
  release(@Param('id') id: string) {
    return this.bookingService.release(+id);
  }

  @ApiOperation({ summary: '催办预订审批' })
  @ApiResponse({ status: HttpStatus.OK, description: '催办成功', type: String })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: '半小时内只能催办一次', type: String })
  @Get('urge/:id')
  urge(@Param('id') id: string) {
    return this.bookingService.urge(+id);
  }
}
