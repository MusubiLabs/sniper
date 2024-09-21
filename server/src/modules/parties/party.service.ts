import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Party } from './party.entity';

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
  
  async finishParty(partyId: string) {
    return {
      data: 'finish party',
    };
  }
}