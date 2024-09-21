import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('goal')
export class Goal extends BaseEntity {
  @Column({ comment: '用户钱包地址' })
  address: string;

  @Column({ comment: '会话ID', nullable: true })
  sessionId: string;

  @Column({ comment: '目标名称' })
  name: string;

  @Column({ comment: '目标描述', nullable: true })
  description: string;

  @Column({ comment: '目标需要的时长' })
  duration: number;

  @Column({ comment: 'Goal存储在ipfs上面的hash', nullable: true })
  goalIpfsCid: string;

  @Column({ comment: '目标是否完成', nullable: true })
  resultIpfsCid: string;

  @Column({ comment: '目标是否结束', default: false })
  isFinished: boolean;

  @Column({ comment: '目标完成时间', nullable: true })
  finishedAt: Date;

  @Column({ comment: '目标是否开始', default: false })
  isStarted: boolean;

  @Column({ comment: '目标开始时间', nullable: true })
  startedAt: Date;
}
