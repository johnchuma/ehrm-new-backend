import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { JournalService } from './journal.service';

@Controller()
export class JournalController {
  constructor(private readonly service: JournalService) {}

  @GrpcMethod('PayrollJournalService', 'GetJournal')
  get(data: { companyId: string; month?: string; year?: string; runId?: string }) { return this.service.getJournal(data); }

  @GrpcMethod('PayrollJournalService', 'ExportJournal')
  export(data: { companyId: string; month: string; year: string }) { return this.service.exportJournal(data); }
}
