import { Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;

  create(createMeetingRoomDto: CreateMeetingRoomDto) {
    return 'This action adds a new meetingRoom';
  }

  findAll() {
    return `This action returns all meetingRoom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} meetingRoom`;
  }

  update(id: number, updateMeetingRoomDto: UpdateMeetingRoomDto) {
    return `This action updates a #${id} meetingRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} meetingRoom`;
  }

  initData() {
    const meetingRooms = [
      {
        name: '第一会议室',
        capacity: 10,
        location: '1楼',
        equipment: '投影仪、白板',
        description: '适合小型会议和讨论',
      },
      {
        name: '第二会议室',
        capacity: 20,
        location: '2楼',
        equipment: '投影仪、白板、视频会议设备',
        description: '适合中型会议和远程视频会议',
      },
      {
        name: '第三会议室',
        capacity: 50,
        location: '3楼',
        equipment: '投影仪、白板、视频会议设备、音响系统',
        description: '适合大型会议和培训活动',
      },
    ];

    meetingRooms.forEach(async (room) => {
      const existingRoom = await this.meetingRoomRepository.findOne({ where: { name: room.name } });
      if (!existingRoom) {
        const newRoom = this.meetingRoomRepository.create(room);
        this.meetingRoomRepository.insert(newRoom);
      }
    });
  }
}
