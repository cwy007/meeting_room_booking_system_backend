# 数据库表与字段命名规范最佳实践

在数据库与后端应用的开发中，关于数据库字段名使用驼峰命名（`camelCase`）还是下划线命名（`snake_case`），业界存在标准的最佳实践。

## 核心原则

**数据库表名和字段名使用下划线命名法（`snake_case`），而代码（TypeScript/JavaScript）中的属性名使用驼峰命名法（`camelCase`）。**

## 为什么数据库推荐使用下划线？

1. **大小写敏感与兼容性**
   大多数关系型数据库（如 PostgreSQL、MySQL、Oracle 等）在处理大小写时的默认行为并不一致。例如，有些数据库默认会将未加引号的标识符转为小写。如果使用驼峰命名（如 `phoneNumber`），在写原生 SQL 查询时往往需要加双引号（`"phoneNumber"`）强制保留大小写，否则会报错。使用下划线（`phone_number`）天然规避了这类大小写折叠或兼容性的问题。

2. **可读性与社区习惯**
   在编写 SQL 脚本或使用数据库客户端执行查询时，全字母小写结合下划线分隔的单词更符合 SQL 社区的普遍习惯和历史标准，阅读起来更直观清晰。

## TypeORM 项目中的具体实践

在 NestJS + TypeORM 体系下，实现“代码中用驼峰，数据库里存下划线”有以下两种常见方式：

### 1. 全局配置命名策略（本项目使用的推荐方式）

通过引入 `typeorm-naming-strategies`，可以配置全局的映射规则，让 TypeORM 自动完成驼峰到下划线的转化。在编写 Entity 类时，只需要专注于代码层面的驼峰命名，完全无需关心数据库底层的格式。

**在 `app.module.ts` 中的配置示例：**

```typescript
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ...其他配置
      namingStrategy: new SnakeNamingStrategy(), // 自动将数据库表和列名转换为下划线命名风格
    }),
  ],
})
export class AppModule {}
```

**在 `User` Entity 中的应用：**

```typescript
@Column({
  length: 20,
  comment: '手机号',
  nullable: true,
})
phoneNumber: string; // 自动映射为数据库中的 phone_number 字段
```

### 2. 在装饰器中显式指定数据库列名（局部配置）

如果你不想或者无法配置全局策略，也可以在实体类中针对需要转换的字段，显式利用 `@Column` 装饰器的 `name` 属性进行指定：

```typescript
@Column({
  name: 'phone_number', // 明确指定数据库中的字段名为下划线格式
  length: 20,
  comment: '手机号',
  nullable: true,
})
phoneNumber: string;
```

## 总结

推荐采用**全局命名策略工具**（如本项目中的 `SnakeNamingStrategy`），它能促使开发者在 TypeScript 中无缝使用优雅的驼峰命名编写业务逻辑，同时在底层的数据库引擎中保持严谨复古的下划线设计。
