import { describe, it, expect, beforeEach, vi } from 'vitest';
import { makeTestDb } from '@/db/test-helpers';
import { users, donations } from '@/db/schema';
import { makeBilling, TIP_AMOUNT_YEN } from './makeBilling';
import type { PaymentGateway, VerifiedTip } from './paymentGateway';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;
let createSpy: ReturnType<typeof vi.fn>;
let verifyResult: VerifiedTip | null;
let gateway: PaymentGateway;

beforeEach(async () => {
  db = await makeTestDb();
  createSpy = vi.fn(async (amount: number) => ({ url: 'https://checkout', sessionId: 'cs_1' }));
  verifyResult = null;
  gateway = {
    createCheckout: createSpy as unknown as PaymentGateway['createCheckout'],
    verifyWebhook: () => verifyResult,
  };
});

describe('createTipCheckout (金額サーバー強制)', () => {
  it('U-N4/E3: 常に 100 円で Checkout 作成(クライアント金額を信用しない)', async () => {
    const billing = makeBilling(db, gateway);
    const session = await billing.createTipCheckout(null);
    expect(session.url).toBe('https://checkout');
    expect(createSpy).toHaveBeenCalledWith(TIP_AMOUNT_YEN, null);
    expect(TIP_AMOUNT_YEN).toBe(100);
  });
});

describe('handleWebhook (署名検証 + 冪等 + アンロックなし)', () => {
  it('U-E1: 署名検証失敗 → invalid、donation を作らない', async () => {
    verifyResult = null;
    const billing = makeBilling(db, gateway);
    expect(await billing.handleWebhook('body', 'bad-sig')).toBe('invalid');
    expect(await db.select().from(donations)).toHaveLength(0);
  });

  it('U-N1/N3: 検証成功 → donation 記録(ゲスト user_id null)', async () => {
    verifyResult = { paymentId: 'pi_1', amount: 100, userId: null };
    const billing = makeBilling(db, gateway);
    expect(await billing.handleWebhook('body', 'ok')).toBe('recorded');
    const rows = await db.select().from(donations);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.userId).toBeNull();
    expect(rows[0]!.amount).toBe(100);
  });

  it('U-E2: 同一 paymentId の二重 webhook → duplicate(1件のみ、冪等)', async () => {
    verifyResult = { paymentId: 'pi_dup', amount: 100, userId: null };
    const billing = makeBilling(db, gateway);
    expect(await billing.handleWebhook('b', 's')).toBe('recorded');
    expect(await billing.handleWebhook('b', 's')).toBe('duplicate');
    expect(await db.select().from(donations)).toHaveLength(1);
  });

  it('U-P1 (D-028): 投げ銭で plan/権限は変わらない(donation 記録のみ、アンロックなし)', async () => {
    const [u] = await db.insert(users).values({ clerkUserId: 'tipper' }).returning();
    verifyResult = { paymentId: 'pi_u', amount: 100, userId: u!.id };
    const billing = makeBilling(db, gateway);
    await billing.handleWebhook('b', 's');
    // users スキーマに plan/unlock カラムが存在しない = 構造的にアンロック不能
    const after = await db.select().from(users);
    expect(Object.keys(after[0]!)).not.toContain('plan');
    expect(Object.keys(after[0]!)).not.toContain('unlockedFeatures');
  });
});

describe('getTipTotal', () => {
  it('累計 count/合計を返す(PII なし)', async () => {
    const billing = makeBilling(db, gateway);
    verifyResult = { paymentId: 'p1', amount: 100, userId: null };
    await billing.handleWebhook('b', 's');
    verifyResult = { paymentId: 'p2', amount: 100, userId: null };
    await billing.handleWebhook('b', 's');
    expect(await billing.getTipTotal()).toEqual({ count: 2, totalYen: 200 });
  });
});
