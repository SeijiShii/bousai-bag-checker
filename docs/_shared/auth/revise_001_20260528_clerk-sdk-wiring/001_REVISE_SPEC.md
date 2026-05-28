# _shared/auth 変更仕様書 (Clerk SDK 実 wiring)

> **改修種別**: 拡張 (release seam 完成、既存設計の deferred 部分を埋める)
> **issue / slug**: 001 / clerk-sdk-wiring
> **基準 SPEC**: `../../001__shared_auth_SPEC.md`
> **最終更新**: 2026-05-28
> **タグ**: auth-required / SEC-001 / O35 inject seam

---

## 1. 変更概要

`SessionResolver` interface (`src/services/auth/authClient.ts`) は完成済だが、`api/_lib/composition.ts` の `releaseSessionResolver` が「release で @clerk 配線」と明示して throw する仮実装のまま。本改修で **`@clerk/backend` を使う `makeClerkSessionResolver` factory を実装**し、`releaseSessionResolver` を実 SDK 注入に置換する。これにより API 全体で Clerk セッション検証が動作 = SEC-001 認可基盤が稼働状態に。

## 2. 変更前 vs 変更後

### 2.1 UC 変更
| UC ID | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| (SPEC §1.1 サーバー側 userId 解決) | `releaseSessionResolver.resolveClerkUserId` が常に throw | `makeClerkSessionResolver` 経由で実 Clerk セッション検証 → userId 抽出 | 設計時点で deferred の seam を release で実 wiring |

### 2.2 入出力変更
| 対象 | 変更前 | 変更後 | 互換性 |
|---|---|---|---|
| `composition()` の `auth` 構築 | `makeAuth(db, releaseSessionResolver)` (throw する seam) | `makeAuth(db, makeClerkSessionResolver({ secretKey: process.env.CLERK_SECRET_KEY! }))` | 互換 (interface 変更なし、内部 seam の実装差し替えのみ) |
| `SessionResolver.resolveClerkUserId(req)` signature | 変更なし (interface 自体は不変) | 同左 | 完全互換 |

### 2.3 データモデル変更
| エンティティ | 変更内容 | マイグレーション要否 |
|---|---|---|
| (なし) | DB 変更なし | 不要 |

### 2.4 バリデーション・エラー変更
| 対象 | 変更前 | 変更後 |
|---|---|---|
| 未認証 request | `throw new Error("...release で配線してください")` (HTTP 500 相当) | Clerk verify session 失敗 → `resolveClerkUserId` が null 返却 → `requireUser` が `UnauthorizedError` (HTTP 401) | 既存 SPEC §4.2 エラーケース通りに動作開始 |

## 3. 影響範囲

| 対象 | 影響度 | 説明 |
|---|---|---|
| `api/_lib/composition.ts` | 高 | releaseSessionResolver → makeClerkSessionResolver 置換 |
| `src/services/auth/clerkAuthClient.ts` | 高 (新規) | `makeClerkSessionResolver` factory 実装 |
| `src/services/auth/clerkAuthClient.test.ts` | 高 (新規) | factory + Clerk verify mock テスト |
| `src/services/auth/makeAuth.ts` | なし | interface 経由で seam 受け取り、変更不要 |
| `package.json` | 低 | `@clerk/backend` 追加 |
| 全 API route (api/*.ts) | 中 | 現状 throw で 500 だったのが、Clerk dev instance キー設定後に 200/401 として動作 (機能ゲートが実稼働) |

<!-- spec-review R3: 後続 revise (Class A no-key) で同 factory pattern を踏襲する想定 — _shared/billing (makeStripeGateway) / _shared/notification (makeResendSender) / 任意で Upstash rate limiter。composition.ts は 4 SDK seam の集約所のため、ここで pattern を確立し続行は機械的に -->


## 4. 後方互換性

- **互換維持**: ✅ (interface 不変、内部 seam の実装注入のみ)
- 非互換要素なし。`CLERK_SECRET_KEY` env 未設定環境では明確な起動エラー (key missing) で fail-fast。

## 5. ロールバック方針

- **コード revert で戻せる**: ✅ (1 commit = composition.ts + clerkAuthClient.ts の 2 ファイル変更のみ、git revert で完全に戻る)
- **DB マイグレーションのロールバック**: 不要 (DB 変更なし)
- **手順**: `git revert <commit>` で `releaseSessionResolver` (throw) に戻る、`@clerk/backend` 依存も自動的に未使用化

## 6. リリース戦略

- **方式**: **一括** (`composition.ts` の seam 1 行置換のため段階展開は不要、フィーチャーフラグも不要)
- **ロールアウト**: dev/test キー (Clerk dev instance) で動作確認 → preview deploy → production deploy 時に Clerk production instance キーへ swap (release.md §3.1 test→live 規約に従う)
- **検証**: ローカル dev で `/api/health` 等の認証なし EP は通る、認証必須 EP は Clerk session を持つ request のみ 200、無 session は 401

## 7. 詳細仕様 (新仕様)

### 7.1 `makeClerkSessionResolver` factory

```typescript
import { createClerkClient } from '@clerk/backend';
import type { SessionResolver } from './authClient';

export interface ClerkConfig {
  secretKey: string;        // CLERK_SECRET_KEY (sk_test_* / sk_live_*)
  publishableKey?: string;  // VITE_CLERK_PUBLISHABLE_KEY (optional、verifyToken に必要な場合)
  jwtKey?: string;          // 任意の JWT 公開鍵 (offline 検証用、未使用なら省略)
}

export function makeClerkSessionResolver(config: ClerkConfig): SessionResolver {
  const clerk = createClerkClient({ secretKey: config.secretKey, publishableKey: config.publishableKey });
  return {
    async resolveClerkUserId(req: unknown): Promise<string | null> {
      // 1. req から Authorization header / __session cookie を抽出 (Vercel ApiReq 互換)
      //    <!-- spec-review R1: req は { headers, url, method } の Web Request minimum subset を満たす形式で
      //         clerk.authenticateRequest の request プロパティに渡す。Vercel ApiReq は標準で同形式を満たす。
      //         narrowing が必要なら `req as { headers?: Record<string,string>; url?: string; method?: string }` -->
      // 2. clerk.authenticateRequest({ request, secretKey, publishableKey }) を呼ぶ
      // 3. status='signed-in' なら toAuth().userId、それ以外は null
      // 4. PII を含むエラーは投げず、log 経由で握りつぶし null 返却 (SEC-002 PII ログ漏洩防止)
    },
  };
}
```

### 7.2 `composition.ts` 改修

```typescript
import { makeClerkSessionResolver } from '../../src/services/auth/clerkAuthClient';

// 変更前: const releaseSessionResolver: SessionResolver = { ... throw ... };
// 変更後: 直接 factory を invoke + env チェック
function getSessionResolver(): SessionResolver {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY env not set');
  }
  return makeClerkSessionResolver({
    secretKey,
    publishableKey: process.env.VITE_CLERK_PUBLISHABLE_KEY,
  });
}

export function composition(): { core: ApiCore; auth: AuthClient } {
  if (!cached) {
    const db = getDb();
    cached = {
      core: makeApiCore(db, { /* gateway, sender, rateLimiter は別 revise で */ }),
      auth: makeAuth(db, getSessionResolver()),
    };
  }
  return cached;
}
```

### 7.3 env 要件

| env var | 必須/任意 | 値の prefix | source |
|---|---|---|---|
| `CLERK_SECRET_KEY` | **必須** | `sk_test_*` (dev) / `sk_live_*` (prod) | Clerk dashboard API keys |
| `VITE_CLERK_PUBLISHABLE_KEY` | 推奨 | `pk_test_*` / `pk_live_*` | 同上 |

## 8. タグ別追加項目

### 8.1 認可 (auth-required / SEC-001)

- `authenticateRequest` の結果 `status` が `signed-in` の場合のみ userId を返す。`signed-out` / `handshake` / その他は全て null。
- `req` の `Authorization: Bearer ...` ヘッダ or `__session` cookie を Clerk SDK に渡す (Vercel Functions の標準 request 互換)。
- secret key は env のみ、コード hardcode 禁止 (SEC-005)。
- 検証失敗時のエラーログには PII (userId / email / IP) を含めず、status コードのみ記録 (SEC-002)。

### 8.2 段階的認証 (O22)

- Clerk anonymous user (`anon_*` で始まる userId) も signed-in 扱いで userId を返す。
- `getOrCreateUser` は anon と permanent を同じ Clerk userId で処理 → SPEC §1.3 通りデータ引き継ぎ。

## 9. 未決事項

- 現時点で論点なし (2026-05-28)。`makeClerkSessionResolver` の挙動は Clerk SDK 公式 `authenticateRequest` パターンに準拠。

## 10. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 (release seam 完成 revise) | /flow:revise |
