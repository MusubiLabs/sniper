import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('party')
export class Party extends BaseEntity {
  @Column({ comment: 'Party Name' })
  name: string;

  @Column({ comment: 'Party Description' })
  description: string;

  @Column({ comment: '链上数据' })
  ipfsHash: string;

  @Column({ comment: '创建 party 的交易 hash' })
  transactionHash: string;
}
