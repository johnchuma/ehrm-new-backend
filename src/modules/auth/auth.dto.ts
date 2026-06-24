import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'exactonlinesoftware@gmail.com' })
  email: string;

  @ApiProperty({ example: 'admin123' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  password: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ required: false })
  companyId?: string;
}
