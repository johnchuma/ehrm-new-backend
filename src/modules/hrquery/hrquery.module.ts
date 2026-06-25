import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { HRQueryController } from './hrquery.controller';
import { HRQueryService } from './hrquery.service';

@Module({
  imports: [AuthModule],
  controllers: [HRQueryController],
  providers: [HRQueryService],
  exports: [HRQueryService],
})
export class HRQueryModule {}
