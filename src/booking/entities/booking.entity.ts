import { MeetingRoom } from "src/meeting-room/entities/meeting-room.entity";
import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '预订开始时间',
  })
  startTime: Date;

  @Column({
    comment: '预订结束时间',
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.APPLYING,
    comment: '预订状态（申请中、审批通过、审批驳回、已解除）',
  })
  status: BookingStatus;

  @Column({
    length: 255,
    comment: '预订备注',
    nullable: true,
  })
  note: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MeetingRoom)
  room: MeetingRoom;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
