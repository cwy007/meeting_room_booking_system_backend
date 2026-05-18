import { MeetingRoom } from "src/meeting-room/entities/meeting-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

export enum BookingStatus {
  /** 申请中 */
  APPLYING = 'APPLYING',
  /** 审批通过 */
  APPROVED = 'APPROVED',
  /** 审批驳回 */
  REJECTED = 'REJECTED',
  /** 已解除 */
  RELEASED = 'RELEASED',
}

@Entity({
  name: 'bookings',
  comment: '预订表',
})
export class Booking {
  /** 预订ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 预订开始时间 */
  @Column({
    comment: '预订开始时间',
  })
  startTime: Date;

  /** 预订结束时间 */
  @Column({
    comment: '预订结束时间',
  })
  endTime: Date;

  @ApiProperty({ enum: BookingStatus, description: '预订状态（申请中、审批通过、审批驳回、已解除）' })
  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.APPLYING,
    comment: '预订状态（申请中、审批通过、审批驳回、已解除）',
  })
  status: BookingStatus;

  /** 预订备注 */
  @Column({
    length: 255,
    comment: '预订备注',
    nullable: true,
  })
  note: string;

  @ApiProperty({ type: () => User, description: '预订人' })
  @ManyToOne(() => User)
  user: User;

  @ApiProperty({ type: () => MeetingRoom, description: '预订会议室' })
  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;

  /** 创建时间 */
  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  /** 更新时间 */
  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
