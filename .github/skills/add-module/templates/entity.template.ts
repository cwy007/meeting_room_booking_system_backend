import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
// import { Exclude } from 'class-transformer'; // 敏感字段用

// 如有枚举状态，在这里定义
export enum XxxStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity({
  name: 'xxxs',       // 复数，SnakeNamingStrategy 自动处理 camelCase → snake_case
  comment: 'xxx 表',
})
export class XxxEntity {
  /** xxx ID */
  @PrimaryGeneratedColumn()
  id: number;

  /** 名称 */
  @Column({
    length: 50,
    comment: '名称',
  })
  name: string;

  /** 描述 */
  @Column({
    length: 255,
    comment: '描述',
    nullable: true,
  })
  description: string;

  // 枚举字段：插件无法推断，必须手写 @ApiProperty
  @ApiProperty({ enum: XxxStatus, description: 'xxx 状态' })
  @Column({
    type: 'enum',
    enum: XxxStatus,
    default: XxxStatus.ACTIVE,
    comment: 'xxx 状态',
  })
  status: XxxStatus;

  // 关联字段：必须用懒加载函数 type: () => RelatedEntity，避免循环依赖
  // @ApiProperty({ type: () => RelatedEntity, description: '关联实体' })
  // @ManyToOne(() => RelatedEntity)
  // relatedEntity: RelatedEntity;

  /** 创建时间 */
  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  /** 更新时间 */
  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
