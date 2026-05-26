import { describe, it, expect, beforeEach } from 'vitest';
import { makeTestDb } from '@/db/test-helpers';
import { makeAuth } from './makeAuth';
import { UnauthorizedError, type SessionResolver } from './authClient';

type TestDb = Awaited<ReturnType<typeof makeTestDb>>;

let db: TestDb;

beforeEach(async () => {
  db = await makeTestDb();
});

/** clerkUserId を固定で返す mock resolver。null で未認証を再現。 */
function mockSession(clerkUserId: string | null): SessionResolver {
  return { resolveClerkUserId: async () => clerkUserId };
}

describe('getOrCreateUser', () => {
  it('U-N1: 新規 clerk_user_id で users 行を作成し内部 id を返す', async () => {
    const auth = makeAuth(db, mockSession('clerk_new'));
    const id = await auth.getOrCreateUser('clerk_new');
    expect(id).toBeTruthy();
  });

  it('U-N2: 既存 clerk_user_id は同じ内部 id を返す (重複作成しない)', async () => {
    const auth = makeAuth(db, mockSession('clerk_x'));
    const id1 = await auth.getOrCreateUser('clerk_x');
    const id2 = await auth.getOrCreateUser('clerk_x');
    expect(id2).toBe(id1);
  });

  it('U-N6 (O22): 同一 clerk_user_id でゲスト→permanent 化しても同じ users 行 (データ引き継ぎ)', async () => {
    const auth = makeAuth(db, mockSession('clerk_guest_then_account'));
    const guestId = await auth.getOrCreateUser('clerk_guest_then_account');
    // サインアップ後も Clerk 同一 userId → 同じ行
    const accountId = await auth.getOrCreateUser('clerk_guest_then_account');
    expect(accountId).toBe(guestId);
  });
});

describe('userId 解決 (SEC-001 信用線)', () => {
  it('U-N3: 認証済セッション → 内部 user.id', async () => {
    const auth = makeAuth(db, mockSession('clerk_a'));
    const userId = await auth.getAuthUserId({});
    expect(userId).toBeTruthy();
  });

  it('U-B1: 未認証 (resolver が null) → getAuthUserId は null', async () => {
    const auth = makeAuth(db, mockSession(null));
    expect(await auth.getAuthUserId({})).toBeNull();
  });

  it('U-N5/E1: requireUser は認証済で id、未認証で UnauthorizedError(401)', async () => {
    const ok = makeAuth(db, mockSession('clerk_b'));
    await expect(ok.requireUser({})).resolves.toBeTruthy();

    const ng = makeAuth(db, mockSession(null));
    await expect(ng.requireUser({})).rejects.toBeInstanceOf(UnauthorizedError);
    await expect(ng.requireUser({})).rejects.toMatchObject({ status: 401 });
  });

  it('U-E5 (SEC-001): リクエストボディの user_id は使わず resolver 解決値のみ', async () => {
    // resolver は clerk_real を返す。req に偽の userId を入れても無視される
    const auth = makeAuth(db, mockSession('clerk_real'));
    const realId = await auth.getOrCreateUser('clerk_real');
    const resolved = await auth.getAuthUserId({ userId: 'spoofed-id', body: { user_id: 'attacker' } });
    expect(resolved).toBe(realId); // req の user_id ではなく resolver 由来
  });
});
