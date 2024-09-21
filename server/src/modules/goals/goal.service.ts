import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private usersRepository: Repository<Goal>,
  ) {}

  async findAll(): Promise<Goal[]> {
    return this.usersRepository.find();
  }

  async create(goal: Partial<Goal>): Promise<Goal> {
    return this.usersRepository.save(goal);
  }
}
