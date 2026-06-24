import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'john@company.co.tz' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: 'cmp_123' })
  companyId?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'john@company.co.tz' })
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+255712345678' })
  phone?: string;

  @ApiPropertyOptional()
  isActive?: boolean;
}

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acacia Group Ltd' })
  name: string;

  @ApiPropertyOptional({ example: 'info@acacia.co.tz' })
  email?: string;

  @ApiPropertyOptional({ example: '+255712345678' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Tanzania' })
  country?: string;

  @ApiPropertyOptional({ example: 'TZS' })
  currency?: string;

  @ApiPropertyOptional({ example: 'HR Professional' })
  subscriptionPlan?: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional({ example: 'Acacia Group Ltd' })
  name?: string;

  @ApiPropertyOptional({ example: 'info@acacia.co.tz' })
  email?: string;

  @ApiPropertyOptional({ example: '+255712345678' })
  phone?: string;

  @ApiPropertyOptional({ example: 'Manufacturing' })
  industry?: string;

  @ApiPropertyOptional({ example: 'Tanzania' })
  country?: string;

  @ApiPropertyOptional({ example: 'TZS' })
  currency?: string;

  @ApiPropertyOptional({ example: 'HR Professional' })
  subscriptionPlan?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: '{\"theme\":\"dark\"}' })
  generalSettings?: string;
}

export class RegisterWorkspaceDto {
  @ApiProperty({ example: 'single' })
  workspaceType: string;

  @ApiProperty({ example: 'Acacia Group Ltd' })
  company: string;

  @ApiPropertyOptional({ example: 1284 })
  employees?: number;

  @ApiPropertyOptional({ example: 'Manufacturing' })
  sector?: string;

  @ApiPropertyOptional({ example: '201–500' })
  size?: string;

  @ApiPropertyOptional({ example: 'Tanzania' })
  country?: string;

  @ApiPropertyOptional({ example: 'TZS' })
  currency?: string;

  @ApiPropertyOptional({ example: [] })
  additionalCompanies?: Array<{
    company: string;
    sector?: string;
    size?: string;
    country?: string;
    currency?: string;
  }>;

  @ApiProperty({ example: 'John' })
  fname: string;

  @ApiProperty({ example: 'Doe' })
  lname: string;

  @ApiProperty({ example: 'john@acacia.co.tz' })
  email: string;

  @ApiProperty({ example: 'demo1234' })
  password: string;

  @ApiPropertyOptional({ example: 'HR Professional' })
  plan?: string;

  @ApiPropertyOptional({ example: 'monthly' })
  billing?: string;

  @ApiPropertyOptional({ example: '+255712345678' })
  phone?: string;
}
