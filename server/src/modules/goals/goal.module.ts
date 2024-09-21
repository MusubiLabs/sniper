import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attention } from '../attentions/attention.entity';
import { GoalsController } from './goal.controller';
import { Goal } from './goal.entity';
import { GoalsService } from './goal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Goal, Attention])],
  providers: [GoalsService],
  controllers: [GoalsController],
})
export class GoalsModule {}
