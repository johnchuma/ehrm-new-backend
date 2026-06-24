import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { CaseService } from './cases/cases.service';
import { ActionService } from './actions/actions.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [CaseService, ActionService],
  exports: [CaseService, ActionService],
})
export class DisciplinaryModule {}
