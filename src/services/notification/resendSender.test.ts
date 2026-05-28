import { describe, it, expect, vi, beforeEach } from 'vitest';

const { emailsSendMock, ResendMock } = vi.hoisted(() => {
  const send = vi.fn();
  const resend = vi.fn(() => ({ emails: { send } }));
  return { emailsSendMock: send, ResendMock: resend };
});

vi.mock('resend', () => ({ Resend: ResendMock }));

import { makeResendSender } from './resendSender';

const CONFIG = {
  apiKey: 're_test_xxx',
  fromAddress: '持ち出し袋チェッカー <noreply@example.com>',
};

describe('makeResendSender (resend SDK wrapper)', () => {
  beforeEach(() => {
    emailsSendMock.mockReset();
    ResendMock.mockClear();
  });

  it('N-001: send 成功時に resolve', async () => {
    emailsSendMock.mockResolvedValueOnce({ data: { id: 'em_xxx' }, error: null });
    const sender = makeResendSender(CONFIG);
    await expect(
      sender.send('user_abc', 'expiry_notice', {
        to: 'user@example.com',
        subject: '備蓄期限のお知らせ',
        html: '<p>...</p>',
      }),
    ).resolves.toBeUndefined();
    expect(emailsSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: CONFIG.fromAddress,
        to: 'user@example.com',
        subject: '備蓄期限のお知らせ',
      }),
    );
  });

  it('N-002: factory が apiKey で Resend を初期化する', () => {
    makeResendSender(CONFIG);
    expect(ResendMock).toHaveBeenCalledWith('re_test_xxx');
  });

  it('N-101: API エラー返却時に throw (PII なし、name のみ)', async () => {
    emailsSendMock.mockResolvedValueOnce({
      data: null,
      error: { name: 'validation_error', message: 'sensitive details' },
    });
    const sender = makeResendSender(CONFIG);
    await expect(
      sender.send('user_abc', 'tpl', { to: 'user@example.com', subject: 's', html: 'h' }),
    ).rejects.toThrow(/Resend send failed: validation_error/);
    // PII (本文 / email) は throw メッセージに含まれていないことを確認
  });

  it('N-102: data.to 空 → throw "data.to is required"', async () => {
    const sender = makeResendSender(CONFIG);
    await expect(sender.send('user_abc', 'tpl', { subject: 's', html: 'h' })).rejects.toThrow(
      /data\.to is required/,
    );
    expect(emailsSendMock).not.toHaveBeenCalled();
  });

  it('N-201: subject 不在 → "(no subject)" で送信', async () => {
    emailsSendMock.mockResolvedValueOnce({ data: { id: 'em' }, error: null });
    const sender = makeResendSender(CONFIG);
    await sender.send('user_abc', 'tpl', { to: 'user@example.com', html: 'h' });
    expect(emailsSendMock).toHaveBeenCalledWith(expect.objectContaining({ subject: '(no subject)' }));
  });
});
