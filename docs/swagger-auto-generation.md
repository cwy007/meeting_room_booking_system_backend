# Swagger 文档自动生成指南

## 插件配置

项目已在 `nest-cli.json` 中配置 `@nestjs/swagger` 插件：

```json
"plugins": [{
  "name": "@nestjs/swagger",
  "options": {
    "classValidatorShim": true,
    "introspectComments": true
  }
}]
```

## 插件自动处理的内容

| 功能                                     | 无插件                  | 有插件                             |
| ---------------------------------------- | ----------------------- | ---------------------------------- |
| DTO 字段类型推断                         | 需手写 `@ApiProperty()` | 自动                               |
| `class-validator` 映射到 required/format | 需手写                  | 自动（`classValidatorShim: true`） |
| 用 JSDoc 注释生成 description            | 不支持                  | 自动（`introspectComments: true`） |
| 路由参数类型（`@Param`、`@Query`）       | 需手写                  | 自动                               |
| 响应体类型（返回值类型注解）             | 需手写                  | 自动                               |

## 哪些装饰器可以省略

**可省略（插件自动生成）：**

- `@ApiQuery(...)` — 插件从 `@Query()` 参数类型自动推断
- `@ApiParam(...)` — 插件从 `@Param()` 参数自动推断
- `@ApiBody(...)` — 插件从 `@Body()` 参数的 DTO 类型自动推断
- DTO 里的 `@ApiProperty()` — 插件从属性类型 + class-validator 自动推断

**仍需手动添加：**

- `@ApiTags(...)` — 分组标签，插件无法推断
- `@ApiOperation({ summary })` — 接口说明（或使用 JSDoc，见下方）
- `@ApiResponse(...)` — 复杂响应结构（如带分页的自定义 schema）
- `@ApiBearerAuth()` / `@ApiBasicAuth()` — 安全认证方式

## 用 JSDoc 替代 `@ApiOperation`

启用 `introspectComments: true` 后，可以用 JSDoc 注释代替 `@ApiOperation`：

```ts
/**
 * 获取会议室列表
 */
@Get('list')
findAll(...) { ... }
```

## 导出部分接口文档

### 方式一：通过 `include` 过滤模块（推荐）

```ts
import { MeetingRoomModule } from './meeting-room/meeting-room.module';

const document = SwaggerModule.createDocument(app, config, {
  include: [MeetingRoomModule],
});
```

### 方式二：导出为 JSON 文件

```ts
import * as fs from 'fs';

const document = SwaggerModule.createDocument(app, config);
fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
```

### 方式三：创建多个 Swagger 端点

```ts
// 完整文档：访问 /api-doc
const fullDocument = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api-doc', app, fullDocument);

// 会议室模块文档：访问 /api-doc/meeting-room
const meetingRoomConfig = new DocumentBuilder()
  .setTitle('会议室接口')
  .setVersion('1.0')
  .addBearerAuth(...)
  .build();
const meetingRoomDocument = SwaggerModule.createDocument(app, meetingRoomConfig, {
  include: [MeetingRoomModule],
});
SwaggerModule.setup('api-doc/meeting-room', app, meetingRoomDocument);
```
