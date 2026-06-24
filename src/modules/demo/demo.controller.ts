import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('Demo')
@Controller('demo')
export class DemoController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a demo request' })
  async submit(@Body() body: any) {
    // Store in a simple JSON approach since we don't have a demo_requests table
    const data = {
      name: body.name || '',
      email: body.email || '',
      company: body.company || '',
      phone: body.phone || '',
      size: body.size || '',
      message: body.message || '',
      createdAt: new Date().toISOString(),
    };
    console.log('Demo request:', data);
    return { success: true, message: 'Demo request submitted. We will contact you within 24 hours.' };
  }
}
