import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'meeting_rooms',
  comment: '会议室表',
})
export class MeetingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '会议室名称',
  })
  name: string;

  @Column({
    comment: '会议室容量',
  })
  capacity: number;

  @Column({
    length: 50,
    comment: '会议室位置',
  })
  location: string;

  @Column({
    length: 50,
    comment: '会议室设备',
    default: '',
  })
  equipment: string;

  @Column({
    length: 255,
    comment: '会议室描述',
    default: '',
  })
  description: string;

  @Column({
    default: false,
    comment: '会议室是否被预订',
  })
  isBooked: boolean;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
