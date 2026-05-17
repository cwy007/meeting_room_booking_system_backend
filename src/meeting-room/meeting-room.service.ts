import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private readonly meetingRoomRepository: Repository<MeetingRoom>;

  async create(createMeetingRoomDto: CreateMeetingRoomDto) {
    const existingRoom = await this.meetingRoomRepository.findOne({
      where: { name: createMeetingRoomDto.name }
    });
    if (existingRoom) {
      throw new HttpException('会议室名称已存在', HttpStatus.BAD_REQUEST);
    }
    return await this.meetingRoomRepository.save(createMeetingRoomDto);
  }

  async findAll(page: number, pageSize: number, name: string, capacity: number, equipment: string) {
    if (page < 1) {
      page = 1;
    }
    if (pageSize < 1) {
      pageSize = 10;
    }
    const [meetingRooms, totalAccount] = await this.meetingRoomRepository.findAndCount({
      where: {
        name: name ? Like(`%${name}%`) : undefined,
        capacity: capacity || undefined,
        equipment: equipment ? Like(`%${equipment}%`) : undefined,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { list: meetingRooms, totalAccount };
  }

  async findOne(id: number) {
    return this.meetingRoomRepository.findOne({
      where: { id }
    });
  }

  async update(updateMeetingRoomDto: UpdateMeetingRoomDto) {
    const { id, ...updateData } = updateMeetingRoomDto;
    const existingRoom = await this.meetingRoomRepository.findOne({
      where: { id }
    });
    if (!existingRoom) {
      throw new HttpException('会议室不存在', HttpStatus.NOT_FOUND);
    }
    if (updateData.name && updateData.name !== existingRoom.name) {
      const nameConflict = await this.meetingRoomRepository.findOne({
        where: { name: updateData.name }
      });
      if (nameConflict) {
        throw new HttpException('会议室名称已存在', HttpStatus.BAD_REQUEST);
      }
    }

    const updatedRoom = this.meetingRoomRepository.merge(existingRoom, updateData);
    return await this.meetingRoomRepository.save(updatedRoom);
  }

  async remove(id: number) {
    await this.meetingRoomRepository.delete(id);
    return 'success';
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
