# _shared/auth 変更計画書 (Clerk SDK 実 wiring)

> **入力**: `./001_REVISE_SPEC.md`, `../001__shared_auth_SPEC.md`, `api/_lib/composition.ts`, `src/services/auth/*`
> **最終更新**: 2026-05-28

---

## 1. 既存ファイル変更一覧

| ファイル | 変更内容 | リスク | 関連 SPEC § |
|---|---|---|---|
| `api/_lib/composition.ts` | `releaseSessionResolver` (throw) 削除 → `getSessionResolver()` で `makeClerkSessionResolver` を invoke (env チェック付き) | 低 (seam 1 箇所、interface 不変) | §2.2, §7.2 |

## 2. 新規ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/services/auth/clerkAuthClient.ts` | `makeClerkSessionResolver(config)` factory + req → session 抽出ロジック | `@clerk/backend` | ~40 |
| `src/services/auth/clerkAuthClient.test.ts` | factory 単体 + mock Clerk client での verify テスト | vitest + mock | ~80 |

## 3. 削除ファイル一覧

(なし)

## 4. マイグレーション要否

- DB スキーマ変更: ❌
- 既存データ変換: ❌
- 設定ファイル変更: ❌
- ストレージパス変更: ❌

→ **MIGRATION 文書不要**

## 5. 実装 Phase 分割

### Phase 1: `@clerk/backend` インストール + 型確認
- `npm install @clerk/backend` (devDeps でなく dependencies に、サーバー実行時必要)
- `createClerkClient` / `authenticateRequest` の型を確認 (TypeScript 補完で動作確認)

### Phase 2: `clerkAuthClient.ts` 実装 (TDD)
- RED: `clerkAuthClient.test.ts` 先に書く (mock Clerk client、verify 成功/失敗/未認証ケース)
- GREEN: `makeClerkSessionResolver` 実装
- IMPROVE: PII ログ除外 / fail-fast / 型整合

### Phase 3: `composition.ts` 改修
- `releaseSessionResolver` 削除 → `getSessionResolver()` 関数で env check + factory invoke
- 既存 `composition()` 内の `makeAuth` 呼び出しを差し替え
- 既存 `composition.test.ts` がある場合は seam 差し替え分の修正 (テスト時は mock SessionResolver を直接 inject する想定)

### Phase 4: 動作確認
- `npm run typecheck` pass
- `npm run test` (全 156 unit + 18 E2E) 維持確認
- `npm run build` pass

## 6. 依存関係順序

```
Phase 1 (npm install)
  ↓
Phase 2 (clerkAuthClient.ts + test)
  ↓
Phase 3 (composition.ts 改修)
  ↓
Phase 4 (全テスト維持確認)
```

## 7. ロールアウト計画

| ステップ | 内容 | 期日 | 検証方法 |
|---|---|---|---|
| 1 | 実装完了 + 全 unit test green | 2026-05-28 | `npm run test` |
| 2 | dev/test キー (Clerk dev instance) で `.env.development.local` FILL | release Phase 1 | `.env.development.local` 確認 |
| 3 | ローカル動作確認 (実機スマホ、軽め課金系含む) | release Phase 2 | `/api/items` 等を Clerk session 持参で叩いて 200 確認 |
| 4 | preview deploy | release Phase 3 | Vercel preview URL で /api/* 200 確認 |
| 5 | production deploy (Clerk production instance live キー) | release §3.1 test→live | 本番 URL で疎通確認 |

## 8. リスク・注意点

- `@clerk/backend` SDK のバージョン互換: package.json `"type": "module"` と ESM 整合確認必要。
- `authenticateRequest` の signature は SDK バージョンで変動 → 実装時に @types 確認。
- Vercel Functions の req オブジェクトは Node.js IncomingMessage / Web Request の互換が版で異なる → `req.headers` 経由で Authorization / Cookie を抽出する safe path に集約。
- secret key を log に流さない (SEC-002)。

## 9. 完了の定義 (DoD)

- [ ] `clerkAuthClient.ts` + test が新規追加
- [ ] `composition.ts` の `releaseSessionResolver` が削除されて `makeClerkSessionResolver` 経由に置換
- [ ] 全 unit test (156+ 件) GREEN
- [ ] 全 E2E test (18 件) GREEN
- [ ] typecheck + build pass
- [ ] `@clerk/backend` が `package.json` dependencies に追加
- [ ] AI_LOG セッション完了

## 10. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 | /flow:revise |
