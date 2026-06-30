import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// Tanzanian statutory social-security / provident fund schemes. These are
// reference data (not tenant-specific), surfaced for payroll configuration
// dropdowns. Employee/employer contribution rates follow the standard
// statutory split.
const PROVIDENT_FUND_SCHEMES = [
  {
    id: 'nssf',
    code: 'NSSF',
    name: 'National Social Security Fund',
    sector: 'Private',
    employeeRate: 10,
    employerRate: 10,
  },
  {
    id: 'psssf',
    code: 'PSSSF',
    name: 'Public Service Social Security Fund',
    sector: 'Public',
    employeeRate: 5,
    employerRate: 15,
  },
];

@ApiTags('Tenant')
@Controller('tenant')
export class TenantController {
  @Get('provident-fund-schemes')
  @ApiOperation({ summary: 'List statutory provident fund schemes' })
  listProvidentFundSchemes() {
    return { data: PROVIDENT_FUND_SCHEMES };
  }
}
