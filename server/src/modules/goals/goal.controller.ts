import { Body, Controller, Get, Post } from '@nestjs/common';
import { Goal } from './goal.entity';
import { GoalsService } from './goal.service';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  findAll(): Promise<Goal[]> {
    return this.goalsService.findAll();
  }

  @Post()
  create(@Body() body: Partial<Goal>): Promise<Goal> {
    return this.goalsService.create(body);
  }
}
