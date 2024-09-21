import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attention } from './attention.entity';

@Injectable()
export class AttentionsService {
  constructor(
    @InjectRepository(Attention)
    private attentionsRepository: Repository<Attention>,
  ) {}

  async findAll(): Promise<Attention[]> {
    return this.attentionsRepository.find();
  }

  async create(goal: Partial<Attention>): Promise<Attention> {
    return this.attentionsRepository.save(goal);
  }
}
