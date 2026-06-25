import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

@ApiTags('Demo')
@Controller('demo')
export class DemoController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
  ) {}

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

    // Notify admin users
    const adminRole = await this.prisma.role.findFirst({
      where: { name: 'System Administrator', isSystem: true },
    });
    if (adminRole) {
      const adminUsers = await this.prisma.userRole.findMany({
        where: { roleId: adminRole.id },
        include: { user: true },
      });
      const bc = this.email.brandColor;
      for (const ur of adminUsers) {
        if (ur.user.email) {
          this.email.send(ur.user.email, 'New Demo Request Received', this.email.buildHtml(`
            <h2 style="color:${bc};margin:0 0 16px">New Demo Request</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Name</td><td style="padding:8px 12px;border:1px solid #eee">${body.name || '—'}</td></tr>
              <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Email</td><td style="padding:8px 12px;border:1px solid #eee">${body.email || '—'}</td></tr>
              <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Company</td><td style="padding:8px 12px;border:1px solid #eee">${body.company || '—'}</td></tr>
              <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Phone</td><td style="padding:8px 12px;border:1px solid #eee">${body.phone || '—'}</td></tr>
              <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Company Size</td><td style="padding:8px 12px;border:1px solid #eee">${body.size || '—'}</td></tr>
              <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;border:1px solid #eee">Message</td><td style="padding:8px 12px;border:1px solid #eee">${body.message || '—'}</td></tr>
            </table>
          `)).catch(() => {});
        }
      }
    }

    return { success: true, message: 'Demo request submitted. We will contact you within 24 hours.' };
  }
}
