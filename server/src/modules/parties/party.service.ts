import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Party } from './party.entity';
import { getRecipientClaimData, getTally, tallyVotes } from 'src/common/utils/maci';
@Injectable()
export class PartyService {
  constructor(
    @InjectRepository(Party)
    private partyRepository: Repository<Party>,
  ) {}

  async create(data: Partial<Party>) {
    return this.partyRepository.save(data);
  }

  async findAll() {
    return this.partyRepository.find();
  }

  async finishParty(partyId: string,  pollId : string, maciInstance: string) {
    const result = await tallyVotes(BigInt(partyId), BigInt(pollId), maciInstance);
    return result;
  }
  
  async getVoteResults(partyId: string) {
    return getTally(BigInt(partyId));
  }
  
  async getClaimData(partyId: string, recipientIndex: number, recipientTreeDepth: number) {
    return getRecipientClaimData(BigInt(partyId), recipientIndex, recipientTreeDepth);
  }

}