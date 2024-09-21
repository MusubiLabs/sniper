import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttentionsController } from './attention.controller';
import { Attention } from './attention.entity';
import { AttentionsService } from './attention.service';

@Module({
  imports: [TypeOrmModule.forFeature([Attention])],
  providers: [AttentionsService],
  controllers: [AttentionsController],
})
export class AttentionsModule {}
