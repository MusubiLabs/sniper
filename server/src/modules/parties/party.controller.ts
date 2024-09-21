import { Body, Controller, Post } from '@nestjs/common';
import { Party } from './party.entity';
import { PartyService } from './party.service';

@Controller('party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post('create')
  create(@Body() body: Partial<Party>): Promise<Party> {
    return this.partyService.create(body);
  }

  @Post('all')
  findAll(): Promise<Party[]> {
    return this.partyService.findAll();
  }
}
