# Meeting Room Booking System — Agent Instructions

NestJS 11 + TypeORM + MySQL + Redis + JWT 会议室预订系统后端。

## 开发命令

```bash
npm run start:dev   # 开发（热重载）
npm run start:debug # 调试
npm run build       # 生产构建
npm run repl        # REPL 交互模式
npm test            # 单元测试（src/**/*.spec.ts）
npm run test:e2e    # E2E 测试
npm run lint        # ESLint
```

## 项目结构

| 模块                | 路径                | 职责                                           |
| ------------------- | ------------------- | ---------------------------------------------- |
| `UserModule`        | `src/user/`         | 注册、登录、修改信息、头像上传、管理员用户列表 |
| `MeetingRoomModule` | `src/meeting-room/` | 会议室 CRUD                                    |
| `BookingModule`     | `src/booking/`      | 预订创建、列表、审批、催办                     |
| `RedisModule`       | `src/redis/`        | `@Global()` — Redis get/set 封装，全局可注入   |
| `EmailModule`       | `src/email/`        | `@Global()` — Nodemailer 邮件发送，全局可注入  |

## 数据库约定

- **命名策略**: `SnakeNamingStrategy`（自动）— TypeScript `camelCase` 属性自动映射到 DB `snake_case`，**不需要**手写 `@Column({ name: '...' })`
- **表名**: 显式设置复数形式 `@Entity({ name: 'users' })`
- **联结表**: 显式命名 `@JoinTable({ name: 'user_roles' })`
- **所有 `@Column`** 必须包含 `comment:` 字段
- `synchronize: true` 仅用于开发，**生产环境必须禁用**
- 详见 [docs/database-naming-conventions.md](docs/database-naming-conventions.md)

## 认证模式

两个全局 Guard（`AppModule` 中注册为 `APP_GUARD`）：

- `LoginGuard` — 检查 `require-login` 元数据，校验 JWT，将 payload 写入 `request.user`
- `PermissionGuard` — 检查 `require-permissions` 元数据

**控制器中使用的装饰器**（来自 `src/custom.decorator.ts`）：

```ts
@RequireLogin()                          // 类或方法级别，要求登录
@RequirePermissions('permission:code')   // 要求特定权限
@UserInfo('userId')                      // 参数装饰器，提取 JWT payload 字段
```

## 响应与异常约定

- **全局响应格式**（`FormatResponseInterceptor`）：所有成功响应包装为 `{ code, message: 'success', data }`
- **普通异常**：抛出 `HttpException` → `CustomExceptionFilter` 处理，返回 `{ code, message: 'fail', data }`
- **未登录异常**：抛出 `UnLoginException`（非 `HttpException` 子类）→ `UnLoginFilter` 处理，HTTP 状态为 **200**，body 中 `code: 401`
- **DTO 验证错误**：`class-validator` 错误由 filter 自动合并为字符串

## DTO 约定

- 所有验证消息使用**中文**：`@IsNotEmpty({ message: '用户名不能为空' })`
- `ValidationPipe({ transform: true })` 全局启用，自动类型转换
- 敏感字段（如 `password`）用 `@Exclude()` 装饰，`ClassSerializerInterceptor` 自动过滤
- 分页参数：`@Query('page', generateParseIntPipe('page'), new DefaultValuePipe(1))`（来自 `src/utils.ts`）

## Swagger 配置

- 仅 `BookingModule` 路由包含在 `/api-doc` 文档中（`main.ts` 中 `include: [BookingModule]`）
- **插件已启用**（`nest-cli.json`）：`classValidatorShim: true`，`introspectComments: true`
  - JSDoc 注释自动成为 `@ApiOperation` summary
  - `@ApiQuery`/`@ApiParam`/`@ApiBody` 可省略
  - 枚举类型和关联实体字段需要手动 `@ApiProperty({ enum: ... })` / `@ApiProperty({ type: () => Entity })`
- 仍需手动添加：`@ApiTags`、`@ApiBearerAuth()`、复杂响应的 `@ApiResponse`
- 详见 [docs/swagger-auto-generation.md](docs/swagger-auto-generation.md)

## 环境变量

`.env` 文件位置：**`src/.env`**（相对于运行时 CWD）。

| 键                                                  | 用途         |
| --------------------------------------------------- | ------------ |
| `nest_server_port`                                  | 监听端口     |
| `mysql_server_host/port/username/password/database` | TypeORM      |
| `redis_server_host/port/db`                         | RedisService |
| `jwt_secret`                                        | JWT 签名     |
| `nodemailer_host/port/auth_user/auth_pass`          | EmailService |

## 常见陷阱

1. **`src/.env` 路径** — 生产环境从 `dist/` 启动时路径会失效，需从项目根目录运行
2. **Swagger 只包含 BookingModule** — 新增模块后，如需出现在文档中，须在 `main.ts` 的 `include` 数组中添加
3. **枚举/关联字段需手动 `@ApiProperty`** — Swagger 插件无法自动推断枚举类型和 `@ManyToOne` 关联
4. **`synchronize: true`** — 仅开发用，生产前必须改为迁移方案
5. **文件上传路径** — `uploads/` 相对于 CWD，生产部署须注意工作目录
