import { Module } from '@nestjs/common';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/common/src/prisma/prisma.module';
import { TaskController } from './tasks/tasks.controller';
import { TaskService } from './tasks/tasks.service';

@Module({
  imports: [CommonModule, PrismaModule.forRoot('tasks')],
  controllers: [TaskController],
  providers: [TaskService],
})
export class AppModule {}
