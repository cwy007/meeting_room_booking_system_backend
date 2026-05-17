import { Controller, Get, Post, Body, Patch, Param, Delete, DefaultValuePipe, Query, Put, HttpStatus, HttpCode } from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { generateParseIntPipe } from 'src/utils';
import { ApiBasicAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { MeetingRoom } from './entities/meeting-room.entity';
import { RequireLogin } from 'src/custom.decorator';

@ApiTags('会议室管理')
@ApiBasicAuth()
@RequireLogin()
@Controller('meeting-room')
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) { }

  @ApiOperation({ summary: '创建会议室' })
  @ApiBody({ type: CreateMeetingRoomDto })
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
  @ApiQuery({ name: 'page', required: false, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'name', required: false, description: '会议室名称模糊搜索', example: '会议室' })
  @ApiQuery({ name: 'capacity', required: false, description: '会议室容量精确搜索', example: 20 })
  @ApiQuery({ name: 'equipment', required: false, description: '会议室设备模糊搜索', example: '投影仪' })
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
  ) {
    return this.meetingRoomService.findAll(page, pageSize, name, capacity, equipment);
  }

  @ApiOperation({ summary: '获取会议室详情' })
  @ApiParam({ name: 'id', description: '会议室ID', example: 1 })
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
  @ApiBody({ type: UpdateMeetingRoomDto })
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
  @ApiParam({ name: 'id', description: '会议室ID', example: 1 })
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
