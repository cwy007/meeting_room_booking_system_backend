---
description: "Use when writing or editing NestJS controller files. Covers Swagger decorator rules: which decorators the plugin auto-generates vs. which must be added manually, and how to handle enums and relation fields."
applyTo: "**/*.controller.ts"
---

# Swagger 装饰器规范

项目已启用 `@nestjs/swagger` 插件（`classValidatorShim: true`，`introspectComments: true`），部分装饰器可以省略。

## 插件自动处理（可省略）

- `@ApiQuery()` — 从 `@Query()` 参数类型自动推断
- `@ApiParam()` — 从 `@Param()` 参数自动推断
- `@ApiBody()` — 从 `@Body()` 的 DTO 类型自动推断
- DTO 里大多数 `@ApiProperty()` — 插件从属性类型 + class-validator 自动推断

## 必须手动添加

**控制器类级别：**
```ts
@ApiTags('分组名称')       // 必须，插件不自动推断
@ApiBearerAuth()          // 需要 JWT 认证的控制器必须添加
```

**方法级别：**
```ts
@ApiOperation({ summary: '...' })   // 或使用 JSDoc 注释代替（见下方）
@ApiResponse({ status, description, type/schema })
```

## 用 JSDoc 代替 `@ApiOperation`

```ts
// 推荐写法
/**
 * 获取预订列表
 */
@Get('list')
findAll(...) {}
```

## 分页列表响应 schema

返回 `{ list, totalCount }` 结构时，使用 `schema` + `getSchemaPath`：

```ts
@ApiResponse({
  status: HttpStatus.OK,
  schema: {
    type: 'object',
    properties: {
      list: {
        type: 'array',
        items: { $ref: getSchemaPath(EntityClass) },
      },
      totalCount: { type: 'number' },
    },
  },
})
```

## 枚举字段

插件**无法**自动推断 `type: 'enum'` 列，实体中必须手动添加：

```ts
@ApiProperty({ enum: BookingStatus, description: '...' })
@Column({ type: 'enum', enum: BookingStatus, ... })
status: BookingStatus;
```

## 关联实体字段（`@ManyToOne` / `@ManyToMany`）

插件**无法**自动推断关联关系，实体中必须手动添加，且使用懒加载函数避免循环依赖：

```ts
@ApiProperty({ type: () => User, description: '预订人' })
@ManyToOne(() => User)
user: User;
```

## Swagger 文档范围

当前 `/api-doc` **仅包含 `BookingModule`**（`main.ts` 中 `include: [BookingModule]`）。
新增模块需要出现在文档中时，须同步更新 `src/main.ts` 的 `include` 数组。
