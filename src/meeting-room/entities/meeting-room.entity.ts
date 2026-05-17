import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'meeting_rooms',
  comment: '会议室表',
})
export class MeetingRoom {
  @ApiProperty({ description: '会议室ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: '会议室名称' })
  @Column({
    length: 50,
    comment: '会议室名称',
    unique: true,
  })
  name: string;

  @ApiProperty({ description: '会议室容量' })
  @Column({
    comment: '会议室容量',
  })
  capacity: number;

  @ApiProperty({ description: '会议室位置' })
  @Column({
    length: 50,
    comment: '会议室位置',
  })
  location: string;

  @ApiProperty({ description: '会议室设备' })
  @Column({
    length: 50,
    comment: '会议室设备',
    default: '',
    nullable: true,
  })
  equipment: string;

  @ApiProperty({ description: '会议室描述' })
  @Column({
    length: 255,
    comment: '会议室描述',
    default: '',
    nullable: true,
  })
  description: string;

  @ApiProperty({ description: '会议室是否被预订' })
  @Column({
    default: false,
    comment: '会议室是否被预订',
    nullable: true,
  })
  isBooked: boolean;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
