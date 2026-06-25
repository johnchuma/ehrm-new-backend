import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';

@Module({
  imports: [AuthModule],
  controllers: [BenefitsController],
  providers: [BenefitsService],
  exports: [BenefitsService],
})
export class BenefitsModule {}
