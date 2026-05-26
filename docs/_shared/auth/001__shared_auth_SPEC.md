# _shared/auth 仕様書 (横断基盤)

> **役割**: 認証基盤。Clerk によるゲスト開始 → 段階的アカウント連携を提供し、サーバー側で Clerk userId を解決して `_shared/db` の withOwner(userId) に供給する。O22 ゲスト→アカウントのデータ引き継ぎを担保。
> **タグ**: cross-cutting, auth-required, stateful (ゲスト→アカウントの状態遷移)
> **最終更新**: 2026-05-26
> **入力アーティファクト**: `../../concept.md` (§1.2 / §3.1 SEC-001 / §4 / §6), `../db/001__shared_db_SPEC.md`, `./README.md`
> **target_type**: cross-cutting (提供インターフェース形式。E2E はスキップ=機能側 E2E でカバー)

---

## 1. 提供インターフェース

### 1.1 サーバー側 userId 解決 (SEC-001 の入口)
- `getAuthUserId(req): string | null` — Clerk セッションから内部 user.id を解決 (未認証=ゲストなら anonymous の id、完全未確立なら null)。
- `requireUser(req): string` — 認証必須エンドポイント用。確立済 user.id を返す、無ければ 401。
- **期待動作**: ここで解決した userId のみを `withOwner(userId)` に渡す。**リクエストボディの user_id は信用しない** (SEC-001)。

### 1.2 ユーザー upsert
- `getOrCreateUser(clerkUserId): user.id` — Clerk userId に対応する users 行を upsert し内部 id を返す。ゲスト (anonymous) も users 行を持つ。

### 1.3 段階的認証 (ゲスト → アカウント、O22)
- ゲスト開始: Clerk Anonymous sign-in で即利用開始 (ログイン画面なし)。
- アカウント化: メール/OAuth でサインアップ時、**Clerk が anonymous→permanent を同一 userId で継続**するため、users.clerk_user_id を維持したままデータが引き継がれる (MVP の主経路)。
- クロスデバイス merge (別端末の anonymous データ統合) は MVP 外 (論点-S-auth-1)。

### 1.4 クライアント側
- `AuthProvider` (Clerk Provider ラッパ) / `useAuthUser()` (現在ユーザー/ゲスト状態) / サインイン・サインアップ UI (Clerk components、design-system トークン適用)。

### 1.5 ルート保護
- API/ページの保護ミドルウェア (Clerk middleware)。投げ銭はログイン不要 (公開)。クラウド同期/品目編集は user 確立必須。

---

## 2. 入出力

### 2.1 提供 API (関数シグネチャ、概念)
| 関数 | 入力 | 出力 | 備考 |
|---|---|---|---|
| `getAuthUserId(req)` | request | user.id \| null | サーバー専用 |
| `requireUser(req)` | request | user.id (401 throw) | 認証必須 EP |
| `getOrCreateUser(clerkUserId)` | clerk id | user.id | upsert |

### 2.2 副作用
- DB: users への upsert (db 基盤経由)。
- 外部: Clerk (SDK + REST、API キーは .env.local サーバー専用、VITE_ 禁止=SEC-005)。

---

## 3. データモデル
新規エンティティなし。`_shared/db` の `users` (id / clerk_user_id / created_at / updated_at) を使用。本基盤は users 行の upsert と userId 解決を担う。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール |
|---|---|
| clerk_user_id | Clerk 検証済セッション由来のみ受理 (偽造不可) |
| 認証必須 EP | user 未確立なら 401 |

### 4.2 エラーケース
| ID | 条件 | 振る舞い |
|---|---|---|
| AU-E1 | 認証必須 EP に未認証アクセス | 401 (PII を含めない、SEC-002) |
| AU-E2 | Clerk セッション期限切れ | 再認証へ誘導 (淡々としたトーン、O38) |
| AU-E3 | getOrCreateUser で clerk_user_id 重複 | upsert で吸収 (DB-E5 と整合) |
| AU-E4 | Clerk 障害/到達不可 | 5xx + リトライ案内、機微情報をログに残さない |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| userId 解決 | < 50ms (セッション検証のオーバーヘッド最小) | CRUD <300ms p95 の内訳 |
| ゲスト開始 | ログイン画面を挟まず即利用 | concept §1.2 段階的認証 |
| Clerk Free | 10k MAU 内 | §4.3 |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| _shared/db | userId 供給 | getAuthUserId → withOwner(userId) (SEC-001) |
| 全 user-scoped 機能 | 認証 | requireUser / useAuthUser を使用 |
| _shared/billing(投げ銭) | 任意連携 | 投げ銭はログイン不要、ログイン時のみ donation.user_id に紐付け |

---

## 6. タグ別追加項目

### 6.1 認可 (auth-required / SEC-001)
- ロール: MVP は単一ロール (本人のみ)。admin は将来 (feedback 閲覧等、MVP では UI なし)。
- 所有者チェック: 本基盤が解決した userId を withOwner に渡すことで全 user-scoped アクセスを所有者強制。
- ゲスト: anonymous も users 行 + userId を持ち、withOwner で自分のデータのみ操作可。

### 6.2 状態遷移 (stateful)
- 状態: `anonymous (ゲスト)` → `account (メール/OAuth 連携済)`。
- 遷移条件: ゲストがサインアップ → Clerk が同一 userId で permanent 化 → users 行はそのまま (clerk_user_id 維持) → データ引き継ぎ (O22)。
- 逆遷移なし (アカウント→ゲストは想定しない)。サインアウトは別 (セッション終了であって状態 downgrade ではない)。

---

## 7. スコープ外
- クロスデバイスのゲストデータ統合 merge (論点-S-auth-1、MVP 外)。
- 複数ロール RBAC (admin 等、v2 / feedback 閲覧 UI)。
- パスキー/MFA (Clerk で将来有効化可、MVP 外)。
- 家族共有のメンバー招待・権限 (v2)。

## 8. 未決事項 (論点リスト)

### [論点-S-auth-1] クロスデバイスのゲストデータ統合
- **影響範囲**: _shared/auth, inventory
- **詰めるべき問い**: 端末 A の anonymous で品目登録 → 端末 B でサインイン した場合、A のデータをどう統合するか。MVP は「Clerk 同一 userId 継続 (同一端末/ブラウザでのサインアップ) のみ引き継ぎ」とし、クロスデバイス merge は対象外とする。
- **推奨**: MVP 対象外 (案: クロスデバイス前は明示せず、サインイン後の主データはクラウド側を正とする)。需要が出たら v2 で merge UX を設計。
- **判断期限**: 公開後の利用実態を見て判断 (v2)
- **担当**: seiji

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (Clerk ゲスト→段階的認証 + userId 解決 + O22 引き継ぎ + 投げ銭はログイン不要) | /flow:feature |
