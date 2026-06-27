import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContractsModule } from '../contracts/contracts.module';
import { EmailService } from '../notifications/email.service';
import { EmployeeController } from './employee.controller';
import { EmployeeCrudController } from './employee-crud.controller';
import { EmployeePatchController } from './employee-patch.controller';
import { EmployeeService } from './employee.service';

@Module({
  imports: [AuthModule, ContractsModule],
  controllers: [EmployeeController, EmployeeCrudController, EmployeePatchController],
  providers: [EmployeeService, EmailService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
