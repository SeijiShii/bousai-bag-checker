# 実装レポート: _shared/auth

## 実装日時
2026-05-27 (JST) / **モード**: feature (cross-cutting, core 実装)

## 関連ドキュメント
- 001/002/003 (_shared/auth) / [AI_LOG](../../AI_LOG/D20260527_022_tdd__shared_auth.md)

## 変更一覧
### Phase 1-2: AuthClient core (injectable)
- `src/services/auth/authClient.ts`: `AuthClient` / `SessionResolver` interface + `UnauthorizedError(401)`
- `src/services/auth/makeAuth.ts`: `makeAuth(db, session)` →
  - `getOrCreateUser(clerkUserId)`: users upsert (onConflictDoUpdate、冪等、O22 同一 userId 継続)
  - `getAuthUserId(req)`: SEC-001 の唯一の信用入口 (resolver 解決値のみ、req の user_id 無視)
  - `requireUser(req)`: 未確立で UnauthorizedError(401)

### Phase 3.5 (deferred、O35)
- 実 Clerk SDK 配線 (`clerkAuthClient` = SessionResolver 実装 / middleware / AuthProvider / useAuthUser) は**実キー段階(/flow:release)**へ。現状は SessionResolver 注入で core を完全テスト。

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| injectable 徹底 | SessionResolver 抽象で Clerk を mock 化、no-key で core を検証 (O35) |
| deferred | 実 Clerk install/wiring は release(実キー必要)。`.env.example` の CLERK_* 追記も release 時 |

## PR Description
### 概要
Clerk ゲスト→段階的認証の core。userId 信用線(SEC-001)と O22 引き継ぎを injectable に実装。
### テスト
7 テスト green (getOrCreateUser 冪等/O22 + userId 解決 + requireUser 401 + req user_id 無視)。typecheck clean。
