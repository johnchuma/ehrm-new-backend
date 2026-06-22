import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { ContractController } from './contracts/contracts.controller';
import { ContractService } from './contracts/contracts.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('contracts')],
  controllers: [ContractController],
  providers: [ContractService],
})
export class AppModule {}
