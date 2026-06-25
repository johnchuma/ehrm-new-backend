import { Injectable } from '@nestjs/common';
import * as axios from 'axios';

function addPrefixToPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) return '255' + cleaned.slice(1);
  if (cleaned.startsWith('255')) return cleaned;
  return '255' + cleaned;
}

@Injectable()
export class SmsService {
  async send(to: string, message: string) {
    try {
      const data = {
        from: 'Exact EHRM',
        to: addPrefixToPhoneNumber(to),
        text: message,
      };

      const response = await axios.default.post(
        'https://messaging-service.co.tz/api/sms/v1/text/single',
        data,
        {
          headers: {
            Authorization: process.env.SMS_AUTH || '',
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        },
      );

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
