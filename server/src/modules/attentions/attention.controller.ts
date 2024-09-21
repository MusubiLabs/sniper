import { Body, Controller, Get, Post } from '@nestjs/common';
import { Attention } from './attention.entity';
import { AttentionsService } from './attention.service';

@Controller('attentions')
export class AttentionsController {
  constructor(private readonly attentionsService: AttentionsService) {}

  @Get()
  findAll(): Promise<Attention[]> {
    return this.attentionsService.findAll();
  }

  @Post()
  create(@Body() body: Partial<Attention>): Promise<Attention> {
    return this.attentionsService.create(body);
  }
}
