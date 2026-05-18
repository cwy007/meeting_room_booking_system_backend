import { Controller, Get, Inject, Query } from '@nestjs/common';
import { StatisticService } from './statistic.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('statistic')
export class StatisticController {
  @Inject(StatisticService)
  private readonly statisticService: StatisticService;

  @ApiOperation({ summary: '获取会议室预订数量' })
  @ApiResponse({
    status: 200,
    description: '获取会议室预订数量成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          roomName: { type: 'string', description: '会议室名称' },
          roomId: { type: 'number', description: '会议室ID' },
          bookingCount: { type: 'number', description: '预订数量' },
        },
      },
    },
  })
  @Get('booking-count-by-room')
  getBookingCountByRoom(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.statisticService.getBookingCountByRoom(startTime, endTime);
  }

  @ApiOperation({ summary: '获取用户预订数量' })
  @ApiResponse({
    status: 200,
    description: '获取用户预订数量成功',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          username: { type: 'string', description: '用户名' },
          userId: { type: 'number', description: '用户ID' },
          bookingCount: { type: 'number', description: '预订数量' },
        },
      },
    },
  })
  @Get('booking-count-by-user')
  getBookingCountByUser(
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
  ) {
    return this.statisticService.getBookingCountByUser(startTime, endTime);
  }
}
