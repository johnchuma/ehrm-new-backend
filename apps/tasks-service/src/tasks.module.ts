import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { TaskService } from './tasks/tasks.service';

@Module({
  imports: [CommonModule, PrismaModule],
  providers: [TaskService],
  exports: [TaskService],
})
export class TasksModule {}
