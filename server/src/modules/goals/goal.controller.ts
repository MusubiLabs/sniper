import { Body, Controller, Get, Post } from '@nestjs/common';
import { Attention } from '../attentions/attention.entity';
import { Goal } from './goal.entity';
import { GoalsService } from './goal.service';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  getAll(): Promise<Goal[]> {
    return this.goalsService.findAll();
  }

  @Post('unfinished')
  findAllUnfinished(@Body() body: { address: string }): Promise<Goal[]> {
    return this.goalsService.findUnfinished(body.address);
  }

  @Post('create')
  create(@Body() body: Partial<Goal>): Promise<Goal> {
    return this.goalsService.create(body);
  }

  @Post('start')
  start(
    @Body() body: { address: string; goalId: string; startedAt: Date },
  ): Promise<Goal> {
    return this.goalsService.start(body);
  }

  @Post('record')
  async record(
    @Body() body: { address: string; goalId: string } & Partial<Attention>,
  ): Promise<Attention> {
    const record = await this.goalsService.record(body);

    return record;
  }

  @Post('detail')
  async detail(@Body() body: { goalId: string }): Promise<any> {
    return await this.goalsService.calculation(body.goalId);
  }

  @Post('finish')
  async finish(@Body() body: { goalId: string }): Promise<any> {
    return await this.goalsService.finishGoal(body.goalId);
  }

  @Post('finshed-goals')
  async finshedGoals(@Body() body: { address: string }): Promise<Goal[]> {
    return await this.goalsService.getFinishGoals(body.address);
  }

  @Post('contribute-data')
  async getContributeData(
    @Body() body: { address: string; startDate: string; endDate: string },
  ): Promise<any> {
    return await this.goalsService.getContributionData(
      body['address'],
      new Date(body['startDate']),
      new Date(body['endDate']),
    );
  }
}
