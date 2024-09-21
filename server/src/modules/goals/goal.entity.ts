import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('goal')
export class Goal extends BaseEntity {
  @Column({ comment: '用户钱包地址' })
  address: string;

  @Column({ comment: '会话ID' })
  sessionId: string;

  @Column({ comment: '目标名称' })
  name: string;

  @Column({ comment: '目标描述' })
  description: string;

  @Column({ comment: '目标需要的时长' })
  duration: number;

  @Column({ comment: '目标结果存储在ipfs上面的hash', nullable: true })
  ipfsHash: string;
}
