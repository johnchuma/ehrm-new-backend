import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ImpersonateDto {
  @ApiProperty({ example: 'clx1234companyid', description: 'ID of the company to impersonate' })
  @IsNotEmpty()
  @IsString()
  targetCompanyId: string;
}
