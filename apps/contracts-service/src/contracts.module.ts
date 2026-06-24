import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ContractService } from './contracts/contracts.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractsModule {}
