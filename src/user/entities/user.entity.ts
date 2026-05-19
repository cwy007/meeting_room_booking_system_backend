import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Exclude } from 'class-transformer';

export enum LoginType {
  USERNAME_PASSWORD = 0,
  GOOGLE = 1,
  GITHUB = 2,
}

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '用户名',
    unique: true,
  })
  username: string;

  @Exclude()
  @Column({
    length: 50,
    comment: '密码',
  })
  password: string;

  @Column({
    length: 50,
    comment: '昵称',
    nullable: true,
  })
  nickName: string;

  @Column({
    length: 50,
    comment: '邮箱',
    unique: true,
  })
  email: string;

  @Column({
    length: 100,
    comment: '头像',
    nullable: true,
  })
  headPic: string;

  @Column({
    length: 20,
    comment: '手机号',
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    default: false,
    comment: '是否冻结',
  })
  isFrozen: boolean;

  @Column({
    default: false,
    comment: '是否管理员',
  })
  isAdmin: boolean;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
  })
  roles: Role[];

  @Column({
    type: 'enum',
    enum: LoginType,
    default: LoginType.USERNAME_PASSWORD,
    comment: '登录类型: 0-用户名密码登录，1-Google登录，2-GitHub登录',
  })
  loginType: LoginType;
}
