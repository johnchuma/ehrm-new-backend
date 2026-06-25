import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, Allow } from 'class-validator';

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

  @ApiPropertyOptional({ example: '#EC782B' })
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#1E84B8' })
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '123-456-789' })
  tin?: string;

  @ApiPropertyOptional({ example: '123 Nyerere Road' })
  address?: string;

  @ApiPropertyOptional({ example: 'Dar es Salaam' })
  city?: string;

  @ApiPropertyOptional({ example: 'Africa/Dar_es_Salaam' })
  timezone?: string;

  @ApiPropertyOptional()
  logo?: string;

  @ApiPropertyOptional({ example: 'https://acacia.co.tz' })
  website?: string;

  @ApiPropertyOptional({ example: 'REG-2024-001' })
  registrationNumber?: string;

  @ApiPropertyOptional()
  tradingName?: string;

  @ApiPropertyOptional({ example: '50-200' })
  size?: string;
}

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: '{\"theme\":\"dark\"}' })
  generalSettings?: string;
}

export class RegisterWorkspaceDto {
  @ApiProperty({ example: 'single' })
  @IsNotEmpty()
  workspaceType: string;

  @ApiProperty({ example: 'Acacia Group Ltd' })
  @IsNotEmpty()
  company: string;

  @ApiPropertyOptional({ example: 1284 })
  @IsOptional()
  employees?: number;

  @ApiPropertyOptional({ example: 'Manufacturing' })
  @IsOptional()
  sector?: string;

  @ApiPropertyOptional({ example: '201–500' })
  @IsOptional()
  size?: string;

  @ApiPropertyOptional({ example: 'Tanzania' })
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'TZS' })
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional({ example: [] })
  @IsOptional()
  additionalCompanies?: Array<{
    company: string;
    sector?: string;
    size?: string;
    country?: string;
    currency?: string;
  }>;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  fname: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lname: string;

  @ApiProperty({ example: 'john@acacia.co.tz' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'demo1234' })
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ example: 'HR Professional' })
  @IsOptional()
  plan?: string;

  @ApiPropertyOptional({ example: 'monthly' })
  @IsOptional()
  billing?: string;

  @ApiPropertyOptional({ example: '+255712345678' })
  @IsOptional()
  phone?: string;
}
