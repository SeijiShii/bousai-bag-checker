# _shared/auth 単体テスト計画 (Clerk SDK 実 wiring)

> **入力**: `./001_REVISE_SPEC.md`, `./002_REVISE_PLAN.md`, `../003__shared_auth_UNIT_TEST.md`, `src/services/auth/makeAuth.test.ts`
> **最終更新**: 2026-05-28

---

## 1. 追加テストケース

### 1.1 正常系 (`clerkAuthClient.test.ts`)
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| C-001 | `makeClerkSessionResolver` factory 生成 | `{ secretKey: 'sk_test_xxx' }` | `SessionResolver` 互換 object 返却、`resolveClerkUserId` メソッド存在 |
| C-002 | session verify 成功 | mock Clerk client が `{ status: 'signed-in', toAuth: () => ({ userId: 'user_abc' }) }` 返す req | `resolveClerkUserId(req)` → `'user_abc'` |
| C-003 | anonymous user 受け入れ | mock が `{ status: 'signed-in', toAuth: () => ({ userId: 'anon_xyz' }) }` | `'anon_xyz'` 返却 (O22 段階的認証で anon も userId 扱い) |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| C-101 | session verify 失敗 | mock が `{ status: 'signed-out' }` 返す | `null` 返却 (throw しない) |
| C-102 | handshake 状態 | mock が `{ status: 'handshake' }` | `null` 返却 |
| C-103 | SDK exception | mock が internal error throw | `null` 返却 + console.error (PII なしのステータスのみ、SEC-002) |
| C-104 | req に header/cookie 無し | empty headers | `null` 返却 (Clerk が判定) |

### 1.3 境界値
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| C-201 | secretKey 空文字 | `{ secretKey: '' }` で factory 呼び出し | `createClerkClient` が throw (起動時 fail-fast) |

## 2. 修正テストケース

| ID | 対象 | 修正前 | 修正後 | 理由 |
|---|---|---|---|---|
| (なし) | `makeAuth.test.ts` の既存テスト | mock `SessionResolver` を直接 inject | 同左 (変更不要) | makeAuth は interface 経由なので concrete impl を意識しない |

## 3. 削除テストケース

(なし、`releaseSessionResolver` は composition.ts 内の単独 const で、独立テストが存在しないため削除対象なし)

## 4. リグレッション強化

- 既存 `makeAuth.test.ts` (req→userId 解決、getOrCreateUser upsert、UnauthorizedError 投げ) 全 GREEN を維持
- 既存 `composition.test.ts` (もし存在すれば) は seam mock 化されているため影響なし

## 5. Mock 方針差分

| 対象 | 前回 | 今回 | 理由 |
|---|---|---|---|
| `@clerk/backend` の `createClerkClient` | (未使用) | `vi.mock('@clerk/backend')` で全 method を mock 化 | SDK call を unit test で再現しないため、authenticateRequest の返り値を制御可能に |

```typescript
// clerkAuthClient.test.ts (抜粋イメージ)
vi.mock('@clerk/backend', () => ({
  createClerkClient: vi.fn(() => ({
    authenticateRequest: vi.fn(async () => ({ status: 'signed-in', toAuth: () => ({ userId: 'user_abc' }) })),
  })),
}));
```

## 6. カバレッジ目標

| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 90%+ (factory 内コード) | 小さなファイル、全 path 網羅可能 |
| 分岐 | 100% (status 分岐 4 種) | signed-in / signed-out / handshake / error 全 case 網羅 |

## 7. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 | /flow:revise |
