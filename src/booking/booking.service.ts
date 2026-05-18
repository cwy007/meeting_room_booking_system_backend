import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Between, EntityManager, Like, Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private readonly bookingRepository: Repository<Booking>;

  @InjectEntityManager()
  private readonly entityManager: EntityManager;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(EmailService)
  private readonly emailService: EmailService;

  async add(createBookingDto: CreateBookingDto, userId: number) {
    const meetingRoomId = createBookingDto.meetingRoomId;
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);
    const note = createBookingDto.note;

    const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
      id: meetingRoomId,
    });
    if (!meetingRoom) {
      throw new HttpException('会议室不存在', HttpStatus.BAD_REQUEST);
    }

    const user = await this.entityManager.findOneBy(User, {
      id: userId,
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }

    const overlappingBooking = await this.bookingRepository.findOne({
      where: {
        room: {
          id: meetingRoomId,
        },
        startTime: Between(startTime, endTime),
      },
    });
    if (overlappingBooking) {
      throw new HttpException('会议室在该时间段已被预订', HttpStatus.BAD_REQUEST);
    }

    const booking = new Booking();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = startTime;
    booking.endTime = endTime;
    booking.note = note;

    await this.entityManager.save(Booking, booking);
    return booking;
  }

  async findAll(
    page: number,
    pageSize: number,
    username: string,
    roomName: string,
    roomLocation: string,
    bookingTimeRangeStart: number,
    bookingTimeRangeEnd: number,
  ) {
    const [bookings, totalCount] = await this.bookingRepository.findAndCount({
      where: {
        user: {
          username: username ? Like(`%${username}%`) : undefined,
        },
        room: {
          name: roomName ? Like(`%${roomName}%`) : undefined,
          location: roomLocation ? Like(`%${roomLocation}%`) : undefined,
        },
        startTime:
          bookingTimeRangeStart && bookingTimeRangeEnd
            ? Between(
              new Date(bookingTimeRangeStart),
              new Date(bookingTimeRangeEnd),
            )
            : undefined,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      relations: ['user', 'room'],
    });
    return { list: bookings, totalCount };
  }

  async approve(id: number) {
    await this.bookingRepository.update(id, {
      status: BookingStatus.APPROVED,
    });
    return id;
  }

  async reject(id: number) {
    await this.bookingRepository.update(id, {
      status: BookingStatus.REJECTED,
    });
    return id;
  }

  async release(id: number) {
    await this.bookingRepository.update(id, {
      status: BookingStatus.RELEASED,
    });
    return id;
  }

  async urge(id: number) {
    const flag = await this.redisService.get(`urge_${id}`);
    if (flag) {
      throw new HttpException('半小时内只能催办一次，请耐心等待', HttpStatus.BAD_REQUEST);
    }

    let email = await this.redisService.get('admin_email');
    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        where: {
          isAdmin: true,
        },
      });
      if (!admin) {
        throw new HttpException('管理员不存在', HttpStatus.INTERNAL_SERVER_ERROR);
      }
      email = admin.email;
      await this.redisService.set('admin_email', email, 60 * 60);
    }

    await this.emailService.sendEmail(email, '催办通知', `请尽快处理编号为 #${id} 的预订请求`);
    await this.redisService.set(`urge_${id}`, '1', 30 * 60);

    return 'success';
  }

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 1,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 1,
    });
    const room2 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 9,
    });

    const booking1 = new Booking();
    booking1.room = room1!;
    booking1.user = user1!;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking1);

    const booking2 = new Booking();
    booking2.room = room2!;
    booking2.user = user2!;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking2);

    const booking3 = new Booking();
    booking3.room = room1!;
    booking3.user = user2!;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking3);

    const booking4 = new Booking();
    booking4.room = room2!;
    booking4.user = user1!;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(Booking, booking4);
  }
}
