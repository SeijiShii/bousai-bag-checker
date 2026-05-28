import { describe, it, expect, vi, beforeEach } from 'vitest';

const { sessionsCreateMock, constructEventMock, StripeMock } = vi.hoisted(() => {
  const create = vi.fn();
  const construct = vi.fn();
  const stripeMock = vi.fn(() => ({
    checkout: { sessions: { create } },
    webhooks: { constructEvent: construct },
  }));
  return { sessionsCreateMock: create, constructEventMock: construct, StripeMock: stripeMock };
});

vi.mock('stripe', () => ({ default: StripeMock }));

import { makeStripeGateway } from './stripeGateway';

const DEFAULT_CONFIG = {
  secretKey: 'sk_test_xxx',
  webhookSecret: 'whsec_xxx',
  successUrl: 'http://localhost:5173/success',
  cancelUrl: 'http://localhost:5173/cancel',
};

describe('makeStripeGateway (stripe SDK wrapper)', () => {
  beforeEach(() => {
    sessionsCreateMock.mockReset();
    constructEventMock.mockReset();
    StripeMock.mockClear();
  });

  describe('createCheckout', () => {
    it('S-001: ログイン済 user で成功時に { url, sessionId } 返却', async () => {
      sessionsCreateMock.mockResolvedValueOnce({ id: 'cs_xxx', url: 'https://checkout.stripe.com/abc' });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      const result = await gw.createCheckout(100, 'user_abc');
      expect(result).toEqual({ url: 'https://checkout.stripe.com/abc', sessionId: 'cs_xxx' });
      expect(sessionsCreateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          metadata: { userId: 'user_abc' },
        }),
      );
    });

    it('S-002: ゲスト (userId=null) で metadata.userId を含まない', async () => {
      sessionsCreateMock.mockResolvedValueOnce({ id: 'cs_yyy', url: 'https://checkout.stripe.com/yyy' });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      const result = await gw.createCheckout(100, null);
      expect(result.sessionId).toBe('cs_yyy');
      const args = sessionsCreateMock.mock.calls[0]![0];
      expect(args.metadata).toEqual({});
    });
  });

  describe('verifyWebhook', () => {
    it('S-003: 署名成功 + checkout.session.completed + paid → VerifiedTip', () => {
      constructEventMock.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_xxx',
            payment_status: 'paid',
            amount_total: 100,
            metadata: { userId: 'user_abc' },
          },
        },
      });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      const tip = gw.verifyWebhook('rawbody', 'sig');
      expect(tip).toEqual({ paymentId: 'cs_xxx', amount: 100, userId: 'user_abc' });
    });

    it('S-004: metadata.userId 不在 → VerifiedTip.userId = null', () => {
      constructEventMock.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_g', payment_status: 'paid', amount_total: 100, metadata: {} } },
      });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      const tip = gw.verifyWebhook('rawbody', 'sig');
      expect(tip?.userId).toBeNull();
    });

    it('S-101: 署名失敗 → null (PII なし)', () => {
      constructEventMock.mockImplementationOnce(() => {
        throw new Error('signature mismatch with leaked-pii-data');
      });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      expect(gw.verifyWebhook('rawbody', 'sig')).toBeNull();
    });

    it('S-102: event.type が checkout.session.completed 以外 → null', () => {
      constructEventMock.mockReturnValueOnce({ type: 'payment_intent.created', data: { object: {} } });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      expect(gw.verifyWebhook('rawbody', 'sig')).toBeNull();
    });

    it('S-103: payment_status ≠ paid → null', () => {
      constructEventMock.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_u', payment_status: 'unpaid', amount_total: 100, metadata: {} } },
      });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      expect(gw.verifyWebhook('rawbody', 'sig')).toBeNull();
    });

    it('S-201: amount_total undefined → VerifiedTip.amount = 0', () => {
      constructEventMock.mockReturnValueOnce({
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_x', payment_status: 'paid', amount_total: null, metadata: {} } },
      });
      const gw = makeStripeGateway(DEFAULT_CONFIG);
      expect(gw.verifyWebhook('rawbody', 'sig')?.amount).toBe(0);
    });
  });

  it('Stripe SDK は secretKey + apiVersion で初期化される', () => {
    makeStripeGateway(DEFAULT_CONFIG);
    expect(StripeMock).toHaveBeenCalledWith('sk_test_xxx', expect.objectContaining({ apiVersion: expect.any(String) }));
  });
});
