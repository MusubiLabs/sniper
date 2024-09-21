import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('attention')
export class Attention extends BaseEntity {
  @Column({ comment: '用户钱包地址' })
  address: string;

  @Column({ comment: '用户创建的todo的地址', nullable: true })
  sessionId: string;

  @Column({ comment: 'goals的id' })
  goalId: string;

  @Column('simple-array', {
    comment: 'Ai 对用户屏幕截图的描述',
    nullable: true,
  })
  observations: string[];

  @Column('int', { comment: '用户的生产力得分', default: 0, nullable: true })
  productivity_score: number;

  @Column('text', { comment: 'ai 对用户生产力的描述', nullable: true })
  assessment: string;

  @Column('text', { comment: 'ai 对用户反馈的描述', nullable: true })
  feedback: string;

  @Column('boolean', { comment: '用户当前是否走神', nullable: true })
  distracted: boolean;

  @Column('simple-array', { comment: '用户截图列表', default: [] })
  screens: string[];
}
