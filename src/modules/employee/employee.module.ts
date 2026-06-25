import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmailService } from '../notifications/email.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeController],
  providers: [EmailService],
})
export class EmployeeModule {}
