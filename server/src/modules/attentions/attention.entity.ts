import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('attention')
export class Attention extends BaseEntity {
  @Column({ comment: '用户钱包地址' })
  address: string;

  @Column({ comment: '用户创建的todo的地址' })
  sessionId: string;

  @Column('simple-array', { comment: 'Ai 对用户屏幕截图的描述' })
  observations: string[];

  @Column('int', { comment: '用户的生产力得分', default: 0 })
  productivityScore: number;

  @Column('text', { comment: 'ai 对用户生产力的描述' })
  assessment: string;

  @Column('text', { comment: 'ai 对用户反馈的描述' })
  feedback: string;

  @Column('boolean', { comment: '用户当前是否走神' })
  distracted: boolean;

  @Column('simple-array', { comment: '用户截图列表' })
  screens: string[];
}
