# _shared/auth 実装計画書 (横断基盤)

> **入力**: `./001__shared_auth_SPEC.md`, `../../concept.md` §1.4 / §4.3 / §6
> **最終更新**: 2026-05-26

---

## 1. 実装対象ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/services/auth/authClient.ts` | **AuthClient interface** (getAuthUserId/requireUser/getOrCreateUser) | — | 40 |
| `src/services/auth/clerkAuthClient.ts` | 実装版 (Clerk SDK 注入) | @clerk/*, db | 120 |
| `src/services/auth/getOrCreateUser.ts` | users upsert | db | 50 |
| `src/middleware.ts` | Clerk middleware (ルート保護、投げ銭/公開は除外) | @clerk/* | 50 |
| `src/components/auth/AuthProvider.tsx` | Clerk Provider ラッパ | @clerk/* | 30 |
| `src/components/auth/auth-ui.tsx` | サインイン/サインアップ UI (Clerk components + design-system トークン) | ui | 60 |
| `src/hooks/useAuthUser.ts` | クライアント現在ユーザー/ゲスト状態 | @clerk/* | 30 |
| `src/services/auth/index.ts` | 公開エクスポート | 上記 | 15 |

## 2. 実装 Phase 分割 (/flow:tdd 連携、injectable + interface default = O35)

### Phase 1 (RED→GREEN→IMPROVE): AuthClient interface + getOrCreateUser
- 対象: `authClient.ts` (interface) + `getOrCreateUser.ts`
- テスト対象: getOrCreateUser が users を upsert し内部 id を返す (mock db 注入)、重複 clerk_user_id を吸収
- ゴール: userId 解決の核が mock で通る

### Phase 2: requireUser / getAuthUserId のロジック (mock Clerk 注入)
- 対象: AuthClient のメソッド (Clerk セッションを抽象した SessionResolver を注入)
- テスト対象: 認証済→user.id、ゲスト→anonymous id、未確立→null、必須 EP で 401
- ゴール: userId 解決ロジックが mock セッションで通る

### Phase 3.5: app/api bootstrap (SDK 統合、O35/O36/O37)
- 対象: `clerkAuthClient.ts` (実 Clerk SDK Inject) + `middleware.ts` + `AuthProvider` + `auth-ui` + `useAuthUser`
- `.env.example` に `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` 追記 (実キーは書かない、VITE_ 禁止で SECRET はサーバー専用)
- ゴール: ゲスト即利用 → サインアップで同一 userId 継続 (O22) を sandbox (dev key or mock) で確認

## 3. 依存関係順序
```
db(users) → authClient interface → getOrCreateUser
  → clerkAuthClient (実装) → middleware / AuthProvider / auth-ui / useAuthUser
```
依存先: _shared/db (設計済)。

## 4. 既存ファイルへの影響
- `_shared/db` の users / withOwner と接続 (getAuthUserId → withOwner の供給線、SEC-001)。

## 5. 横断フォルダへの追加・変更
- db: users への upsert アクセス。ui: サインイン UI のトークン適用。

## 6. リスク・注意点
- **SECRET をクライアントに露出させない** (SEC-005): CLERK_SECRET_KEY は Vercel Functions 専用、VITE_ プレフィックス禁止。
- **userId の出所を信用線で固定** (SEC-001): getAuthUserId が唯一の信用入口。リクエストの user_id を直接使わない。
- **O22 引き継ぎ**: Clerk anonymous→permanent の同一 userId 継続に依存。Clerk の挙動 (バージョン) を sandbox で確認 (論点-S-auth-1 はクロスデバイスのみ MVP 外)。
- ゲスト乱用 (anonymous 大量生成) によるコスト: 投げ銭/公開 EP のレート制限 (SEC-004) と連動。

## 7. 完了の定義 (DoD)
- [ ] AuthClient interface + getOrCreateUser が mock db で通る
- [ ] userId 解決 (認証/ゲスト/未確立) が mock セッションで通る
- [ ] 実 Clerk Inject + middleware + AuthProvider + サインイン UI が sandbox で動作
- [ ] ゲスト→サインアップの同一 userId 継続 (O22) を確認
- [ ] SECRET の VITE_ 露出なし (ビルド grep チェック、L2 secure)
- [ ] 単体テストカバレッジ 80%/70%
- [ ] 統合は機能側 E2E でカバー (cross-cutting のため本フォルダ E2E なし)

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (interface→mock→実 Clerk の 3 Phase、O22 引き継ぎ) | /flow:feature |
