import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { TransferService } from './transfers/transfers.service';
import { PromotionService } from './promotions/promotions.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [TransferService, PromotionService],
  exports: [TransferService, PromotionService],
})
export class MovementModule {}
