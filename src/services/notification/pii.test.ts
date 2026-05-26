import { describe, it, expect } from 'vitest';
import { scrubPII, sentryBeforeSend } from './pii';

describe('scrubPII (SEC-002 / 論点-005)', () => {
  it('U-P1: 文字列中のメールをマスク', () => {
    expect(scrubPII('連絡先 a.b+x@example.co.jp です')).toBe('連絡先 ***@*** です');
  });

  it('U-P1: PII キー (email) は REDACTED', () => {
    expect(scrubPII({ email: 'a@b.com', name: '水' })).toEqual({ email: '[REDACTED]', name: '水' });
  });

  it('U-P2: token / authorization / storage_location も REDACTED', () => {
    const out = scrubPII({ token: 'xyz', authorization: 'Bearer z', storage_location: '寝室の棚', qty: 3 });
    expect(out).toEqual({ token: '[REDACTED]', authorization: '[REDACTED]', storage_location: '[REDACTED]', qty: 3 });
  });

  it('再帰: ネストした PII も処理、非 PII は保持', () => {
    const out = scrubPII({ user: { email: 'x@y.com', clerkUserId: 'c1' }, items: ['水', 'メール z@w.com'] });
    expect(out).toEqual({ user: { email: '[REDACTED]', clerkUserId: '[REDACTED]' }, items: ['水', 'メール ***@***'] });
  });

  it('U-P4: sentryBeforeSend は event から PII を除去', () => {
    const event = { message: 'err', extra: { email: 'a@b.com', route: '/items' } };
    expect(sentryBeforeSend(event)).toEqual({ message: 'err', extra: { email: '[REDACTED]', route: '/items' } });
  });
});
