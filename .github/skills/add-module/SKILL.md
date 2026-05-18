---
name: add-module
description: "新增 NestJS 模块的完整流程，涵盖本项目所有约定。Use when: 添加新模块、新功能模块、新业务实体、create module、新增 CRUD。按照 entity → DTO → service → controller → module → AppModule 注册 → Swagger include 的顺序执行。"
argument-hint: "模块名称（例如：meeting-room、booking、user）"
---

# 新增 NestJS 模块

## 前置说明

本项目约定：
- **DB 命名**：`SnakeNamingStrategy` 自动处理，无需手写 `@Column({ name })` — 详见 [database-naming-conventions.md](../../../docs/database-naming-conventions.md)
- **Swagger 规则**：插件自动处理 `@ApiQuery`/`@ApiParam`/`@ApiBody`；枚举和关联字段必须手写 `@ApiProperty` — 详见 [swagger.instructions.md](../../instructions/swagger.instructions.md)
- **验证消息**：一律使用中文
- **响应格式**：`FormatResponseInterceptor` 自动包装，controller 直接 return 数据即可

---

## 步骤 1 — 创建 Entity

文件路径：`src/<module>/entities/<module>.entity.ts`

**约定清单：**
- `@Entity({ name: '<table_name_plural>', comment: '...' })` — 表名用复数
- 每个 `@Column()` 必须包含 `comment:` 字段
- 日期用 `@CreateDateColumn` / `@UpdateDateColumn`，无需手写类型
- 枚举列用 `type: 'enum', enum: XxxEnum`，并添加 `@ApiProperty({ enum: XxxEnum })`
- 关联字段（`@ManyToOne` 等）添加 `@ApiProperty({ type: () => RelatedEntity })`（懒加载避免循环依赖）
- 普通字段用 JSDoc 注释（`/** 字段描述 */`）让 Swagger 插件自动推断 description
- 敏感字段（如密码）加 `@Exclude()`

参考模板：[entity.template.ts](./templates/entity.template.ts)

---

## 步骤 2 — 创建 DTOs

文件路径：`src/<module>/dto/create-<module>.dto.ts`、`update-<module>.dto.ts`

**约定清单：**
- `class-validator` 验证消息**全部用中文**：`@IsNotEmpty({ message: '字段不能为空' })`
- `@IsInt`、`@IsString`、`@MinLength` 等搭配 `message` 一起使用
- 可选字段用 `@IsOptional()`
- Update DTO 通常继承 `PartialType(CreateXxxDto)` 并加 `id` 字段
- DTO 字段类型不需要 `@ApiProperty()`（插件自动推断），但枚举字段例外

---

## 步骤 3 — 创建 Service

文件路径：`src/<module>/<module>.service.ts`

**约定清单：**
- 注入方式：`@InjectRepository(Entity)` 用 Repository；`@InjectEntityManager()` 用 EntityManager；`@Inject(RedisService)` / `@Inject(EmailService)` 用全局服务
- 业务异常抛 `HttpException`（不要抛 `Error`）：
  ```ts
  throw new HttpException('资源不存在', HttpStatus.BAD_REQUEST);
  ```
- 分页查询使用 `findAndCount`，返回 `{ list, totalCount }`
- 模糊搜索使用 `Like(\`%\${value}%\`)`（值为空时传 `undefined`）

---

## 步骤 4 — 创建 Controller

文件路径：`src/<module>/<module>.controller.ts`

**约定清单（Swagger）：**
- 类级别：`@ApiTags('模块名')` + `@ApiBearerAuth()`（需要登录时）+ `@RequireLogin()`
- 方法级别：用 JSDoc 注释代替 `@ApiOperation`（插件自动转换）
- 每个方法添加 `@ApiResponse`（至少 200；有业务错误时加 400）
- 列表接口用 `schema + getSchemaPath` 描述响应结构（见 [swagger.instructions.md](../../instructions/swagger.instructions.md)）
- **不要**手写 `@ApiQuery`、`@ApiParam`、`@ApiBody`（插件自动处理）
- 分页参数写法：
  ```ts
  @Query('page', generateParseIntPipe('page'), new DefaultValuePipe(1)) page: number
  ```

---

## 步骤 5 — 创建 Module

文件路径：`src/<module>/<module>.module.ts`

**约定清单：**
- `TypeOrmModule.forFeature([Entity])` 注册本模块的实体
- 全局模块（`RedisModule`、`EmailModule`）无需 import，直接注入使用
- 如需跨模块使用 service，在 `exports` 中声明

```ts
@Module({
  imports: [TypeOrmModule.forFeature([XxxEntity])],
  controllers: [XxxController],
  providers: [XxxService],
  exports: [XxxService],   // 如需对外暴露
})
export class XxxModule {}
```

---

## 步骤 6 — 注册到 AppModule

文件路径：`src/app.module.ts`

需要修改两处：

**① TypeORM entities 数组**（在 `TypeOrmModule.forRootAsync` 的 `entities` 字段）：
```ts
entities: [User, Role, Permission, MeetingRoom, Booking, XxxEntity],
```

**② imports 数组**：
```ts
imports: [
  // ... 已有模块
  XxxModule,
],
```

---

## 步骤 7 — 按需加入 Swagger 文档

文件路径：`src/main.ts`

当前 `/api-doc` **只包含 `BookingModule`**。若新模块需要出现在文档中，修改 `include` 数组：

```ts
const document = SwaggerModule.createDocument(app, config, {
  include: [BookingModule, XxxModule],
});
```

> 不需要在文档中暴露的内部模块可以不加。

---

## 完成检查清单

- [ ] Entity 已创建，所有 `@Column` 有 `comment`，表名为复数
- [ ] 枚举字段有 `@ApiProperty({ enum: ... })`
- [ ] 关联字段有 `@ApiProperty({ type: () => ... })`
- [ ] DTOs 已创建，验证消息为中文
- [ ] Service 已创建，业务异常用 `HttpException`
- [ ] Controller 已创建，有 `@ApiTags` + `@ApiBearerAuth()` + `@ApiResponse`
- [ ] Module 已创建并导入 `TypeOrmModule.forFeature`
- [ ] `AppModule` 的 `entities` 数组和 `imports` 均已更新
- [ ] （按需）`main.ts` 的 Swagger `include` 已更新
