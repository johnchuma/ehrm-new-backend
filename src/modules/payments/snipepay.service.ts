import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const SNIPEPAY_BASE = 'https://api.snipepay.co.tz/v1';
const SNIPEPAY_API_KEY = process.env.SNIPEPAY_API_KEY || 'snp_08ca9cbb5ad22e9182b401ba31c510bacd8b5c65ab58096f9dd3935c5bec94a5';

export interface SnipepayInitiatePayload {
  amount: number;
  currency: string;
  reference: string;
  description: string;
  callbackUrl: string;
  customerEmail: string;
  customerName: string;
}

export interface SnipepayInitiateResponse {
  success: boolean;
  paymentUrl: string;
  transactionRef: string;
  expiresAt: string;
}

export interface SnipepayWebhookPayload {
  event: string;
  transactionRef: string;
  reference: string;
  status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  paidAt?: string;
  failureReason?: string;
  signature: string;
}

@Injectable()
export class SnipepayService {
  private readonly logger = new Logger(SnipepayService.name);

  constructor(private readonly http: HttpService) {}

  async initiatePayment(payload: SnipepayInitiatePayload): Promise<SnipepayInitiateResponse> {
    try {
      const response = await firstValueFrom(
        this.http.post<SnipepayInitiateResponse>(
          `${SNIPEPAY_BASE}/payments/initiate`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${SNIPEPAY_API_KEY}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
      return response.data;
    } catch (err: any) {
      this.logger.error('Snipepay initiate failed', err?.response?.data ?? err.message);
      throw new BadRequestException(
        err?.response?.data?.message ?? 'Payment gateway unavailable. Try again.',
      );
    }
  }

  async checkStatus(transactionRef: string): Promise<{ status: string; paidAt?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.get<any>(`${SNIPEPAY_BASE}/payments/${transactionRef}/status`, {
          headers: { Authorization: `Bearer ${SNIPEPAY_API_KEY}` },
        }),
      );
      return { status: response.data.status, paidAt: response.data.paidAt };
    } catch (err: any) {
      this.logger.error('Snipepay status check failed', err?.response?.data ?? err.message);
      throw new BadRequestException('Could not fetch payment status');
    }
  }

  // Verify the webhook signature to prevent spoofed callbacks
  verifyWebhookSignature(payload: SnipepayWebhookPayload): boolean {
    // Snipepay signs webhooks — implement HMAC verification once they share the secret.
    // For now accept all inbound webhooks (tighten before production).
    return true;
  }
}
