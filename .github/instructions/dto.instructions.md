---
description: "Use when creating or editing NestJS DTO files. Covers class-validator usage, Chinese error messages, JSDoc for Swagger descriptions, @ApiProperty rules, and pagination patterns."
applyTo: "**/dto/*.dto.ts"
---

# DTO 编写规范

## 验证消息必须用中文

所有 `class-validator` 装饰器的 `message` 必须使用中文：

```ts
@IsNotEmpty({ message: '用户名不能为空' })
@MinLength(2, { message: '用户名不能少于2个字符' })
@IsEmail({}, { message: '邮箱格式不正确' })
@IsNumber({}, { message: 'xxx必须是数字' })
@IsInt({ message: 'xxx必须是整数' })
@IsEnum(XxxEnum, { message: 'xxx值不合法' })
```

## JSDoc 注释驱动 Swagger 描述

字段描述通过 JSDoc 注释提供，插件（`introspectComments: true`）自动转换为 Swagger description，**无需手写 `@ApiProperty({ description })`**：

```ts
/** 会议室 ID */
@IsNotEmpty({ message: '会议室ID不能为空' })
meetingRoomId: number;

/** 预订开始时间（时间戳，毫秒） */
@IsNumber({}, { message: '开始时间必须是数字' })
startTime: number;
```

## 可选字段必须加 @IsOptional

没有 `@IsNotEmpty` 的可选字段，必须显式加 `@IsOptional()`，否则 `ValidationPipe` 会在字段传入时仍触发其他验证器：

```ts
/** 备注 */
@IsOptional()
@IsString({ message: '备注必须是字符串' })
note: string;
```

## 何时需要手写 @ApiProperty

插件可自动推断大多数类型，以下情况**必须**手写：

| 情况 | 写法 |
|------|------|
| 枚举类型 | `@ApiProperty({ enum: XxxEnum })` |
| 可选字段 | `@ApiPropertyOptional()` |
| 数组类型 | `@ApiProperty({ type: [String] })` 或 `{ isArray: true, type: () => Xxx }` |

```ts
@ApiProperty({ enum: BookingStatus, description: '状态' })
@IsEnum(BookingStatus, { message: '状态值不合法' })
status: BookingStatus;

@ApiPropertyOptional()
@IsOptional()
@IsString()
remark: string;
```

## Update DTO 继承 PartialType

```ts
import { PartialType } from '@nestjs/swagger'; // 注意：用 swagger 版本而非 mapped-types

export class UpdateXxxDto extends PartialType(CreateXxxDto) {
  /** xxx ID */
  @IsNotEmpty({ message: 'ID不能为空' })
  @IsInt({ message: 'ID必须是整数' })
  id: number;
}
```

> 使用 `@nestjs/swagger` 的 `PartialType`（不是 `@nestjs/mapped-types`），以保留 Swagger 文档中的字段信息。

## 分页查询 DTO 参数写法

分页参数在 controller 的 `@Query` 中使用，不放在 DTO 里：

```ts
// controller 中
@Query('page', generateParseIntPipe('page'), new DefaultValuePipe(1)) page: number,
@Query('pageSize', generateParseIntPipe('pageSize'), new DefaultValuePipe(10)) pageSize: number,
```
