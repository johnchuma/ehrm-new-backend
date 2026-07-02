import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

/**
 * Price-only plan edit. The super-admin dashboard may ONLY change a plan's
 * price — never its name, slug, limits, features, etc. The global ValidationPipe
 * runs with `whitelist: true, forbidNonWhitelisted: true`, so any field other
 * than the two below is rejected with a 400 ("property X should not exist").
 */
export class UpdatePlanPriceDto {
  @ApiPropertyOptional({ description: 'Monthly price (>= 0).' })
  @IsOptional()
  @IsNumber({}, { message: 'monthlyPrice must be a number' })
  @Min(0, { message: 'monthlyPrice cannot be negative' })
  monthlyPrice?: number;

  @ApiPropertyOptional({ description: 'Annual price (>= 0).' })
  @IsOptional()
  @IsNumber({}, { message: 'annualPrice must be a number' })
  @Min(0, { message: 'annualPrice cannot be negative' })
  annualPrice?: number;
}
