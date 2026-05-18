import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class StatisticService {

  @InjectEntityManager()
  private readonly entityManager: EntityManager;


  async getBookingCountByRoom(startTime: string, endTime: string) {
    // 2026-05-18
    const startTimeDate = startTime ? startTime : `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endTimeDate = endTime ? endTime : `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
    const result = await this.entityManager
      .createQueryBuilder(Booking, 'booking')
      .leftJoin('booking.room', 'room')
      .select('room.name', 'roomName')
      .addSelect('room.id', 'roomId')
      .addSelect('COUNT(booking.id)', 'bookingCount')
      .where('booking.startTime between :startTime and :endTime', {
        startTime: startTimeDate,
        endTime: endTimeDate,
      })
      .groupBy('room.id')
      .getRawMany();
    return result;
  }

  async getBookingCountByUser(startTime: string, endTime: string) {
    const startTimeDate = startTime ? startTime : `${new Date().getFullYear()}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endTimeDate = endTime ? endTime : `${tomorrow.getFullYear()}-${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}-${tomorrow.getDate().toString().padStart(2, '0')}`;
    const result = await this.entityManager
      .createQueryBuilder(Booking, 'booking')
      .leftJoin('booking.user', 'user')
      .select('user.username', 'username')
      .addSelect('user.id', 'userId')
      .addSelect('COUNT(booking.id)', 'bookingCount')
      .where('booking.startTime between :startTime and :endTime', {
        startTime: startTimeDate,
        endTime: endTimeDate,
      })
      .groupBy('user.id')
      .getRawMany();
    return result;
  }
}
