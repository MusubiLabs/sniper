import { Body, Controller, Post } from '@nestjs/common';
import { Party } from './party.entity';
import { PartyService } from './party.service';

@Controller('party')
export class PartyController {
  constructor(private readonly partyService: PartyService) { }

  @Post('create')
  create(@Body() body: Partial<Party>): Promise<Party> {
    return this.partyService.create(body);
  }

  @Post('all')
  findAll(): Promise<Party[]> {
    return this.partyService.findAll();
  }

  @Post('finish')
  finishParty(@Body() body: { partyId: string, pollId: string, maciInstance: string }) {
    return this.partyService.finishParty(body.partyId, body.pollId, body.maciInstance);
  }

  @Post('vote-results')
  getVoteResults(@Body() body: { partyId: string[] }) {
    return this.partyService.getVoteResults(body.partyId);
  }
  @Post('claim-data')
  getClaimData(@Body() body: { partyId: string, recipientIndex: number, recipientTreeDepth: number }) {
    return this.partyService.getClaimData(body.partyId, body.recipientIndex, body.recipientTreeDepth);
  }
}
