import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, Query, Put, HttpStatus, HttpCode, Req } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from 'src/utils';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { MeetingRoom } from './entities/meeting-room.entity';
import { RequireLogin } from 'src/custom.decorator';
import { type Request } from 'express';

@ApiTags('会议室管理')
@ApiBasicAuth()
@RequireLogin()
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) { }

  @ApiOperation({ summary: '创建会议室' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '会议室创建成功',
    type: MeetingRoom,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室名称已存在',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Post('create')
  create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomService.create(createMeetingRoomDto);
  }

  @ApiOperation({ summary: '获取会议室列表' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取会议室列表成功',
    schema: {
      type: 'object',
      properties: {
        list: {
          type: 'array',
          items: {
            $ref: getSchemaPath(MeetingRoom),
          },
          description: '会议室列表',
        },
        totalAccount: {
          type: 'number',
          description: '会议室总数量',
        },
      },
    },
  })
  @Get('list')
  findAll(
    @Query('page', generateParseIntPipe('page'), new DefaultValuePipe(1)) page: number,
    @Query('pageSize', generateParseIntPipe('pageSize'), new DefaultValuePipe(10)) pageSize: number,
    @Query('name') name: string,
    @Query('capacity') capacity: number,
    @Query('equipment') equipment: string,
    @Req() req: Request,
  ) {
    console.log('请求用户信息', req.user);
    return this.meetingRoomService.findAll(page, pageSize, name, capacity, equipment);
  }

  @ApiOperation({ summary: '获取会议室详情' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '获取会议室详情成功',
    type: MeetingRoom,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '会议室不存在',
    type: String,
  })
  @Get(':id')
  async findOne(@Param('id', generateParseIntPipe('id')) id: number) {
    return this.meetingRoomService.findOne(id);
  }

  @ApiOperation({ summary: '更新会议室信息' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '会议室更新成功',
    type: MeetingRoom,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '会议室不存在',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '会议室名称已存在',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Put('update')
  async update(@Body() updateMeetingRoomDto: UpdateMeetingRoomDto) {
    return this.meetingRoomService.update(updateMeetingRoomDto);
  }

  @ApiOperation({ summary: '删除会议室' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '会议室删除成功',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '会议室不存在',
    type: String,
  })
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async remove(@Param('id', generateParseIntPipe('id')) id: number) {
    return this.meetingRoomService.remove(id);
  }
}
