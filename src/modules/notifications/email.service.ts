import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const BRAND_COLOR = '#EC782B';
const LOGO_URL = process.env.EMAIL_LOGO_URL || 'https://test.exactehrm.co.tz/assets/logo.png';

function template(bodyContent: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td align="center" style="padding-bottom:24px">
          <img src="${LOGO_URL}" alt="ExactEHRM" style="height:40px;width:auto" />
        </td></tr>
        <tr><td style="background:#fff;border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="color:#1a1a1a;font-size:15px;line-height:1.6">
              ${bodyContent}
            </td></tr>
            <tr><td style="padding-top:24px;border-top:1px solid #eee;margin-top:24px;font-size:13px;color:#888;text-align:center">
              ExactEHRM &mdash; Run your entire workforce from one place.<br/>
              <a href="${process.env.FRONTEND_URL || 'https://exactehrm.co.tz'}" style="color:${BRAND_COLOR};text-decoration:none">exactehrm.co.tz</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  get brandColor(): string { return BRAND_COLOR; }
  get logoUrl(): string { return LOGO_URL; }

  buildHtml(bodyContent: string): string {
    return template(bodyContent);
  }

  async send(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"ExactEHRM" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
      });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
