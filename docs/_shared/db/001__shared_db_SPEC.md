# _shared/db 仕様書 (横断基盤)

> **役割**: DB スキーマ・マイグレーション基盤。Neon (Postgres) テーブル定義 (Drizzle ORM) + インデックス + 所有者強制クエリヘルパ (SEC-001) を全機能に提供する。
> **タグ**: cross-cutting, auth-required (所有者分離)
> **最終更新**: 2026-05-26
> **入力アーティファクト**: `../../concept.md` (§3 NFR / §3.1 SEC / §4.3 / §5 / §1.4), `./README.md`
> **target_type**: cross-cutting (UI なし、提供インターフェース形式。E2E はスキップ=機能側 E2E でカバー)

---

## 1. 提供インターフェース

本基盤は「テーブルスキーマ」「型」「DB クライアント」「所有者強制クエリヘルパ」「マイグレーション」を提供する。各機能はこれを import して使う。

### 1.1 DB クライアント
- `db`: Drizzle インスタンス (Neon 接続)。`DATABASE_URL` (env、サーバー専用) から生成。
- 期待動作: Vercel Functions (サーバー側) でのみ生成・利用。クライアントバンドルに含めない (SEC-005、`VITE_` プレフィックス禁止)。

### 1.2 所有者強制クエリヘルパ (SEC-001、最重要)
```
withOwner(userId: string)
  → 指定ユーザーが所有する行のみに絞り込むクエリビルダ群を返す
  例: ownedItems(userId).findMany() / .findById(id) / .insert(values) / .update(id, values) / .delete(id)
```
- **期待動作**: 全 user-scoped テーブル (items / notification_settings / inspection_logs / shopping_items) へのアクセスは `withOwner(userId)` 経由を必須とする。**Neon は RLS 非対応**のため、アプリ層で全クエリに `where user_id = :userId` を機械的に付与する唯一の窓口。donations / feedback は user_id nullable (ゲスト投げ銭 / ゲスト送信可) のため withOwner 対象外 (書き込みは認証任意、読み出し UI は MVP になし)。
- `findById(id)` は「id 一致 **かつ** user_id 一致」で 1 行返す (他人の id を渡しても null = IDOR 防止)。
- `update`/`delete` も id + user_id の複合条件で実行 (所有者でなければ 0 行更新 = 拒否)。
- userId は Clerk 認証セッション由来 (auth 基盤が解決した値) のみを受け取る。生のリクエストボディの user_id は信用しない。

### 1.3 型エクスポート
- 各テーブルの `Insert` / `Select` 型 (Drizzle 推論) を `types/` で再エクスポート。

---

## 2. 入出力

### 2.1 提供 API (関数シグネチャ、概念)
| 関数 | 入力 | 出力 | 備考 |
|---|---|---|---|
| `db` | (env DATABASE_URL) | Drizzle instance | サーバー専用 |
| `withOwner(userId)` | userId: string | owner-scoped query helpers | SEC-001 の窓口 |
| `runMigrations()` | — | void | drizzle-kit migrate ラッパ (CI/起動前) |

### 2.2 副作用
- DB 読み書き: 全テーブル (機能が呼ぶ)。
- 外部呼び出し: Neon (Postgres wire protocol)。
- マイグレーション: `drizzle-kit generate` (差分 SQL 生成) + `migrate` (適用)。

---

## 3. データモデル

> concept §5.1 を確定スキーマ化。**論点-001 (期限のない品目の鮮度)** は `items.freshness_type` + nullable な期限/交換目安カラムで案A・案B どちらでも収容できる形にし、確定は inventory feature 設計時 (担当: seiji)。

### 3.1 新規エンティティ (7 テーブル)

#### users
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | 内部 ID |
| clerk_user_id | text | UNIQUE, NOT NULL | Clerk のユーザー ID (ゲスト→アカウント連携) |
| created_at / updated_at | timestamptz | NOT NULL default now() | |

> plan/tier 区分は持たない (全機能無料、投げ銭は機能アンロックを伴わない — D-028)。

#### items
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL, INDEX | 所有者 (SEC-001) |
| name | text | NOT NULL | 品目名 |
| category | text enum('water','food','battery','medicine','document','other') | NOT NULL | 区分 |
| quantity | integer | NOT NULL default 1 | 数量 |
| storage_location | text | nullable | 保管場所 (世帯防犯情報、本人限定) |
| photo_url | text | nullable | R2 オブジェクトキー |
| freshness_type | text enum('expiry','replace_guide','check_only') | NOT NULL default 'expiry' | 論点-001: 期限あり/交換目安/内容確認のみ |
| expires_at | date | nullable | freshness_type='expiry' 時に使用 |
| replace_months | integer | nullable | freshness_type='replace_guide' 時の交換目安 (月) |
| note | text | nullable | |
| created_at / updated_at | timestamptz | NOT NULL default now() | |

- INDEX: `(user_id)`, `(user_id, expires_at)` ← cron 期限抽出 (§5.2) 用。

#### notification_settings (1 user 1 行)
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| user_id | uuid | PK, FK→users.id | |
| email_enabled | boolean | NOT NULL default false | メール通知 (任意 ON) |
| inapp_enabled | boolean | NOT NULL default true | アプリ内通知 |
| lead_days | integer | NOT NULL default 14 | 期限何日前に通知 |
| quiet_hours_start / quiet_hours_end | time | nullable | 通知抑制時間帯 |
| created_at / updated_at | timestamptz | NOT NULL default now() | |

#### inspection_logs
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL, INDEX | |
| inspected_at | timestamptz | NOT NULL default now() | |
| summary | jsonb | NOT NULL | 点検結果 (件数/OK/要交換 等) |
| created_at | timestamptz | NOT NULL default now() | |

#### donations (投げ銭記録、機能アンロックなし — D-028)
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, **nullable** | ゲスト投げ銭可。ログイン時のみ紐付け |
| stripe_payment_id | text | NOT NULL, UNIQUE | Stripe PaymentIntent / Checkout Session ID (冪等性) |
| amount | integer | NOT NULL default 100 | 投げ銭額(円) |
| created_at | timestamptz | NOT NULL default now() | |

> donations は機能アンロックを持たない (純粋な支援記録)。集計のみ (§4.6 任意記録)。

#### shopping_items (買い物 TODO リスト、無料機能 — D-028)
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL, INDEX | |
| item_id | uuid | FK→items.id, nullable | 元品目への参照 (手動追加は null) |
| name | text | NOT NULL | 買うもの名 |
| reason | text enum('expired','insufficient','manual') | NOT NULL | TODO 起こし理由 |
| is_bought | boolean | NOT NULL default false | 購入済みフラグ |
| bought_at | timestamptz | nullable | |
| created_at | timestamptz | NOT NULL default now() | |

#### feedback
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, **nullable** (ゲスト送信可) | |
| type | text enum('reaction','bug') | NOT NULL | |
| payload | jsonb | NOT NULL | PII scrub 済 (SEC-002/O28/O40) |
| context | jsonb | NOT NULL | route / version / UA (PII 除外) |
| created_at | timestamptz | NOT NULL default now() | |

### 3.2 既存エンティティへの変更
なし (新規 PJ、本基盤が初期スキーマを定義)。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション (DB 層 + アプリ層の境界)
| 対象 | ルール | 備考 |
|---|---|---|
| user_id | 全 user-scoped 操作で NOT NULL (feedback 除く) | withOwner で強制 |
| category / freshness_type / reason / type | enum 値のみ | DB enum + アプリ層 Zod (O24、機能側) |
| quantity / lead_days / replace_months | 非負整数 | アプリ層 Zod |
| 文字列長 | name 等に上限 (例: 200 字) | アプリ層 Zod (機能側 SPEC) |

> 入力スキーマ (Zod) の一元化は各機能 SPEC の責務 (論点-006 / SEC-003)。本基盤は DB 制約 (NOT NULL / enum / FK) を提供。

### 4.2 エラーケース
| ID | 条件 | 振る舞い |
|---|---|---|
| DB-E1 | 他人の行を findById/update/delete | withOwner により 0 行 = null / 拒否 (IDOR 防止、SEC-001) |
| DB-E2 | FK 制約違反 (存在しない user_id 等) | 例外 → 機能側で 400/404 にマップ |
| DB-E3 | 接続失敗 / タイムアウト | 例外 → 機能側でリトライ or 5xx (PII を含めない、SEC-002) |
| DB-E4 | enum 範囲外 | DB 制約違反例外 (アプリ層 Zod で事前に弾く) |
| DB-E5 | unique 制約違反 (clerk_user_id 重複) | upsert で吸収 (auth 連携時) |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| CRUD クエリ応答 | < 300ms p95 (concept §3) | 品目数十〜100件/世帯の軽量データ |
| ストレージ | Neon Free 0.5GB 内 (§3) | jsonb は最小限、photo は R2 (DB に持たない) |
| インデックス | user_id 系 + (user_id, expires_at) | 所有者絞り + cron 期限抽出の高速化 |
| コネクション | サーバーレス向け (Neon serverless driver / pooling) | Vercel Functions の短命接続 |

### 5.2 既存機能連携 (被依存)
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| _shared/auth | userId 解決 | withOwner に渡す Clerk userId を auth が提供 |
| inventory / inspection / shopping-list / notification | テーブル + withOwner | user-scoped 機能は所有者ヘルパ経由 |
| billing(投げ銭) / feedback | donations / feedback テーブル | user_id nullable のため withOwner 非経由 (ゲスト可) |

---

## 6. タグ別追加項目

### 6.1 認可 (auth-required / SEC-001)
- **所有者チェック**: `withOwner(userId)` を全 user-scoped アクセスの唯一の窓口とする。生クエリ (`db.select().from(items)` を user_id フィルタなしで) を禁止 (lint or レビューで担保)。
- **RLS**: Neon は RLS 非対応 → アプリ層強制で代替 (concept §3.1 SEC-001)。将来 RLS 対応 DB に移行する場合の備えとして user_id を全テーブルに保持。
- feedback / donations は user_id nullable (ゲスト送信 / ゲスト投げ銭)。書き込みは認証不要だが、読み出し (管理) は将来 admin スコープ (MVP では読み出し UI なし)。

---

## 7. スコープ外
- 実データのマイグレーション運用 (本番適用は /flow:release、破壊的変更は Class B)。
- RLS ポリシー (Neon 非対応、アプリ層強制で代替)。
- 監査ログテーブル (家族共有 v2 で検討)。
- 全文検索 / シャーディング (低スケールのため不要)。

## 8. 未決事項 (論点リスト)

### [論点-S-db-1] freshness_type の最終形は inventory 設計時に確定
- **影響範囲**: items テーブル, inventory, inspection
- **詰めるべき問い**: concept §8 論点-001 (案A=3種 freshness / 案B=期限ありのみ通知) の確定。本スキーマは案A前提で `freshness_type` + nullable 期限/交換目安を用意済み (案Bでも未使用カラムが残るだけで可逆)。
- **推奨**: 案A (concept 推奨)。inventory feature 設計時に最終確定 (担当: seiji)。スキーマは確定後 migration で微調整可。
- **判断期限**: inventory feature 設計時
- **担当**: seiji

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (7 テーブル + withOwner 所有者強制 + 論点-001 収容スキーマ) | /flow:feature |
