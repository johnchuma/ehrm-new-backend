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
    await this.prisma.demoRequest.create({
      data: {
        name: body.name || '',
        email: body.email || '',
        company: body.company || null,
        phone: body.phone || null,
        size: body.size || null,
        message: body.message || null,
      },
    });
    return { success: true, message: 'Demo request submitted. We will contact you within 24 hours.' };
  }
}
