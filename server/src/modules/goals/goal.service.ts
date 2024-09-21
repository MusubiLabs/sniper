import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { eachDayOfInterval, format } from 'date-fns';
import judgeAttention from 'src/common/utils/judgeAttention';
import { Between, Raw, Repository } from 'typeorm';
import { Attention } from '../attentions/attention.entity';
import { Goal } from './goal.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal)
    private goalRepository: Repository<Goal>,
    @InjectRepository(Attention)
    private attentionsRepository: Repository<Attention>,
  ) {}

  async findAll(): Promise<Goal[]> {
    return this.goalRepository.find();
  }

  async findById(id: string, address: string): Promise<Goal> {
    return this.goalRepository.findOne({
      where: {
        id,
        address: Raw((alias) => `LOWER(${alias}) = LOWER('${address}')`, {
          value: address,
        }),
      },
    });
  }

  async findUnfinished(address: string): Promise<Goal[]> {
    console.log(address);

    return await this.goalRepository.find({
      where: {
        address: Raw((alias) => `LOWER(${alias}) = LOWER('${address}')`, {
          value: address,
        }),
        isFinished: false,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async create(goal: Partial<Goal>): Promise<Goal> {
    return this.goalRepository.save(goal);
  }

  async start(body: {
    address: string;
    goalId: string;
    startedAt: any;
  }): Promise<Goal> {
    const { address, goalId, startedAt } = body;

    const goal = await this.findById(goalId, address);

    // 已经开始或者已经结束，则直接报错
    if (goal.isStarted || goal.isFinished) {
      throw new Error('Goal already started or finished');
    }

    return this.goalRepository.save({
      ...goal,
      isFinished: false,
      isStarted: true,
      startedAt: new Date(startedAt),
    });
  }

  async record(
    body: { address: string; goalId: string } & Partial<Attention>,
  ): Promise<Attention> {
    const { address, goalId } = body;

    const goal = await this.findById(goalId, address);

    // 未开始或者已经结束，则直接报错
    if (!goal.isStarted || goal.isFinished) {
      throw new Error('Goal not started or finished');
    }

    const aiResult = await judgeAttention({
      goal: goal.name,
      description: goal.description,
      screens: body.screens,
    });

    const attention = await this.attentionsRepository.save({
      goalId,
      address,
      screens: body.screens,
      ...aiResult,
    });

    return attention;
  }

  async calculation(goalId: string) {
    const goal = await this.goalRepository.findOne({ where: { id: goalId } });

    if (!goal) {
      throw new Error('Goal not found');
    }

    // 未开始或者已经结束，则直接报错
    if (!goal.isStarted || goal.isFinished) {
      throw new Error('Goal not started or finished');
    }

    const { startedAt } = goal;

    // goal消耗的时间，按照分钟计算
    const duration = (Date.now() - startedAt.getTime()) / (60 * 1000);

    const attentions = await this.attentionsRepository.find({
      where: { goalId },
    });

    const averageProductivityScore =
      attentions.reduce(
        (sum, attention) => sum + attention.productivity_score,
        0,
      ) / attentions.length;

    const distractionCount = attentions.filter(
      (attention) => !attention.distracted,
    ).length;

    return {
      counts: attentions.length, // 记录的次数
      duration: duration.toFixed(0), // 记录的分数
      averageProductivityScore: averageProductivityScore.toFixed(2), // 平均生产力分数
      distractionCount, // 注意力缺失的次数
    };
  }

  async finishGoal(goalId: string) {
    const goal = await this.goalRepository.findOne({ where: { id: goalId } });

    if (!goal) {
      throw new Error('Goal not found');
    }

    // 未开始或者已经结束，则直接报错
    if (!goal.isStarted || goal.isFinished) {
      throw new Error('Goal not started or finished');
    }

    return this.goalRepository.save({
      ...goal,
      isFinished: true,
      finishedAt: new Date(),
    });
  }

  async getFinishGoals(address: string) {
    const goals = await this.goalRepository.find({
      where: {
        address: Raw((alias) => `LOWER(${alias}) = LOWER('${address}')`, {
          value: address,
        }),
        isFinished: true,
      },
      order: {
        finishedAt: 'DESC',
      },
    });

    const calculateGoals = await Promise.all(
      goals?.map(async (goal) => {
        const { startedAt, id: goalId, finishedAt } = goal;

        // goal消耗的时间，按照分钟计算
        const duration =
          (finishedAt.getTime() - startedAt.getTime()) / (60 * 1000);

        const attentions = await this.attentionsRepository.find({
          where: { goalId },
        });

        const averageProductivityScore =
          attentions.reduce(
            (sum, attention) => sum + attention.productivity_score,
            0,
          ) / attentions.length;

        const distractionCount = attentions.filter(
          (attention) => !attention.distracted,
        ).length;

        return {
          ...goal,
          result: {
            counts: attentions.length, // 记录的次数
            duration: duration.toFixed(0), // 记录的分数
            averageProductivityScore: averageProductivityScore.toFixed(2), // 平均生产力分数
            distractionCount, // 注意力缺失的次数
          },
        };
      }),
    );

    return calculateGoals;
  }

  async getContributionData(address: string, startDate: Date, endDate: Date) {
    // 确保日期范围不超过一年
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (startDate < oneYearAgo) {
      startDate = oneYearAgo;
    }

    // 直接查询该日期范围内的所有 attentions
    const attentions = await this.attentionsRepository.find({
      where: {
        address: Raw((alias) => `LOWER(${alias}) = LOWER('${address}')`, {
          value: address,
        }),
        createdAt: Between(startDate, endDate),
      },
    });

    // 创建一个Map来存储每天的数据
    const dailyData = new Map();

    // 初始化日期范围内的每一天
    eachDayOfInterval({ start: startDate, end: endDate }).forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      dailyData.set(dayKey, { totalScore: 0, count: 0 });
    });

    // 计算每天的平均生产力分数
    attentions.forEach((attention) => {
      const dayKey = format(new Date(attention.createdAt), 'yyyy-MM-dd');
      const dayData = dailyData.get(dayKey);
      if (dayData) {
        dayData.totalScore += attention.productivity_score;
        dayData.count += 1;
      }
    });

    // 转换数据格式以适应前端需求
    const contributionData = Array.from(dailyData, ([date, data]) => {
      const averageScore = data.count > 0 ? data.totalScore / data.count : 0;
      return {
        date,
        score: averageScore,
        count: data.count,
        level: this.calculateContributionLevel(averageScore),
      };
    });

    return contributionData;
  }

  private calculateContributionLevel(score: number): number {
    if (score <= 3) return 0;
    if (score <= 6) return 1;
    if (score <= 7) return 2;
    if (score <= 8) return 3;
    return 4;
  }
}
