import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentsService } from './payments.service';
import { SnipepayService } from './snipepay.service';
import {
  PaymentsController,
  PlansController,
  SuperAdminPaymentsController,
} from './payments.controller';

@Module({
  imports: [HttpModule],
  controllers: [PlansController, PaymentsController, SuperAdminPaymentsController],
  providers: [PaymentsService, SnipepayService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
