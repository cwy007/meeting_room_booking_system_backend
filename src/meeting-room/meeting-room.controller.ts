import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, Query, Put } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from 'src/utils';

@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) { }

  @Post('create')
  create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomService.create(createMeetingRoomDto);
  }

  @Get('list')
  findAll(
    @Query('page', generateParseIntPipe('page'), new DefaultValuePipe(1)) page: number,
    @Query('pageSize', generateParseIntPipe('pageSize'), new DefaultValuePipe(10)) pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string,
  ) {
    return this.meetingRoomService.findAll(page, pageSize, name, capacity, equipment);
  }

  @Get(':id')
  async findOne(@Param('id', generateParseIntPipe('id')) id: number) {
    return this.meetingRoomService.findOne(id);
  }

  @Put('update')
  async update(@Body() updateMeetingRoomDto: UpdateMeetingRoomDto) {
    return this.meetingRoomService.update(updateMeetingRoomDto);
  }

  @Delete(':id')
  async remove(@Param('id', generateParseIntPipe('id')) id: number) {
    return this.meetingRoomService.remove(id);
  }
}
