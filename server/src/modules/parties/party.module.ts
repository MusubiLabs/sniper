import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartyUserJoined } from './party-user-goal.entity';
import { PartyController } from './party.controller';
import { Party } from './party.entity';
import { PartyService } from './party.service';

@Module({
  imports: [TypeOrmModule.forFeature([Party, PartyUserJoined])],
  providers: [PartyService],
  controllers: [PartyController],
})
export class PartyModule {}
