import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalsController } from './goal.controller';
import { Goal } from './goal.entity';
import { GoalsService } from './goal.service';

@Module({
  imports: [TypeOrmModule.forFeature([Goal])],
  providers: [GoalsService],
  controllers: [GoalsController],
})
export class GoalsModule {}
