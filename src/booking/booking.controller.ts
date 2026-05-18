import { Controller, Get, Post, Body, Patch, Param, Delete, Query, DefaultValuePipe, HttpCode, HttpStatus } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { generateParseIntPipe } from 'src/utils';
import { RequireLogin, UserInfo } from 'src/custom.decorator';

@RequireLogin()
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }

  @HttpCode(HttpStatus.OK)
  @Post('add')
  add(@Body() createBookingDto: CreateBookingDto, @UserInfo('userId') userId: number) {
    return this.bookingService.add(createBookingDto, userId);
  }

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

  @Get('approve/:id')
  approve(@Param('id') id: string) {
    return this.bookingService.approve(+id);
  }

  @Get('reject/:id')
  reject(@Param('id') id: string) {
    return this.bookingService.reject(+id);
  }

  @Get('release/:id')
  release(@Param('id') id: string) {
    return this.bookingService.release(+id);
  }

  @Get('urge/:id')
  urge(@Param('id') id: string) {
    return this.bookingService.urge(+id);
  }
}
