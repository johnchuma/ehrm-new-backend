import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller';
import { EmailService } from '../notifications/email.service';

@Module({
  controllers: [EmployeeController],
  providers: [EmailService],
})
export class EmployeeModule {}
