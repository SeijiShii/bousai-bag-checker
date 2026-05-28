import { Resend } from 'resend';
import type { EmailSender } from './makeNotification';

/**
 * Resend SDK 注入用 factory (release seam の実装、O35)。
 * composition.ts の sender 注入ポイントから呼ばれ、makeApiCore に渡される。
 * keyless テストは resendSender.test.ts で resend を mock する。
 */
export interface ResendConfig {
  apiKey: string;
  fromAddress: string;
}

export function makeResendSender(config: ResendConfig): EmailSender {
  const resend = new Resend(config.apiKey);
  return {
    async send(userId: string, template: string, data: Record<string, unknown>): Promise<void> {
      const to = (data.to as string) ?? '';
      if (!to) throw new Error('resendSender: data.to is required');
      const subject = (data.subject as string) ?? '(no subject)';
      const html = (data.html as string) ?? '';

      const result = await resend.emails.send({
        from: config.fromAddress,
        to,
        subject,
        html,
        tags: [
          { name: 'template', value: template },
          { name: 'userId', value: userId },
        ],
      });

      if (result.error) {
        // SEC-002: PII を含む本文は出さず、error.name のみ記録
        throw new Error(`Resend send failed: ${result.error.name ?? 'unknown'}`);
      }
    },
  };
}
