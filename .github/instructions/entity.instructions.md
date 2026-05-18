---
description: "Use when creating or editing TypeORM entity files. Covers naming conventions, required @Column comment, SnakeNamingStrategy rules, @Exclude for sensitive fields, and @ApiProperty requirements for enum and relation fields."
applyTo: "**/entities/*.entity.ts"
---

# TypeORM Entity 编写规范

## 表名与命名

- `@Entity({ name: '<复数表名>', comment: '...' })` — 表名**必须**显式设置为复数形式
- 属性名使用 `camelCase`，`SnakeNamingStrategy` 自动映射为 DB `snake_case`
- **禁止**手写 `@Column({ name: 'snake_case_name' })` 来覆盖列名，命名策略已全局处理

```ts
// ✅ 正确
@Entity({ name: 'meeting_rooms', comment: '会议室表' })
export class MeetingRoom {
  @Column({ comment: '会议室名称' })
  name: string;          // DB 列名自动为 name（本身已是 snake）

  @Column({ comment: '是否已预订' })
  isBooked: boolean;     // DB 列名自动为 is_booked
}

// ❌ 错误：不要手写 name
@Column({ name: 'is_booked', comment: '是否已预订' })
isBooked: boolean;
```

## @Column 必须包含 comment

每个 `@Column`、`@CreateDateColumn`、`@UpdateDateColumn` **都必须**包含 `comment` 字段：

```ts
@Column({ comment: '用户名', length: 50 })
username: string;

@CreateDateColumn({ comment: '创建时间' })
createTime: Date;
```

## 联结表必须显式命名

`@ManyToMany` 的 `@JoinTable` 必须手动指定 `name`：

```ts
@JoinTable({ name: 'user_roles' })
roles: Role[];

@JoinTable({ name: 'role_permissions' })
permissions: Permission[];
```

## 敏感字段用 @Exclude

密码、Token 等敏感字段加 `@Exclude()`，`ClassSerializerInterceptor` 会自动从响应中过滤：

```ts
import { Exclude } from 'class-transformer';

@Exclude()
@Column({ comment: '密码（MD5）', select: false })
password: string;
```

## 枚举字段必须手写 @ApiProperty

Swagger 插件无法推断 `type: 'enum'` 列，**必须**显式添加：

```ts
import { ApiProperty } from '@nestjs/swagger';

@ApiProperty({ enum: BookingStatus, description: '预订状态' })
@Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.APPLYING, comment: '预订状态' })
status: BookingStatus;
```

## 关联字段必须手写 @ApiProperty（懒加载函数）

Swagger 插件无法推断 `@ManyToOne` / `@OneToMany` 等关联，**必须**使用懒加载函数避免循环依赖：

```ts
@ApiProperty({ type: () => User, description: '预订人' })
@ManyToOne(() => User)
user: User;

@ApiProperty({ type: () => MeetingRoom, description: '预订的会议室' })
@ManyToOne(() => MeetingRoom)
room: MeetingRoom;
```

## 普通字段用 JSDoc 注释

普通字段用 JSDoc 注释代替 `@ApiProperty()`，让插件自动推断 description：

```ts
/** 会议室名称 */
@Column({ length: 50, comment: '会议室名称', unique: true })
name: string;
```

## 完整示例结构

```ts
@Entity({ name: 'xxxs', comment: 'xxx 表' })
export class Xxx {
  /** xxx ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 名称 */
  @Column({ length: 50, comment: '名称' })
  name: string;

  @ApiProperty({ enum: XxxStatus, description: 'xxx 状态' })
  @Column({ type: 'enum', enum: XxxStatus, default: XxxStatus.ACTIVE, comment: 'xxx 状态' })
  status: XxxStatus;

  @ApiProperty({ type: () => RelatedEntity, description: '关联实体' })
  @ManyToOne(() => RelatedEntity)
  related: RelatedEntity;

  /** 创建时间 */
  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  /** 更新时间 */
  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;
}
```
