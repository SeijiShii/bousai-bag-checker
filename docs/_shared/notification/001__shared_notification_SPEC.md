# _shared/notification 仕様書 (横断基盤)

> **役割**: 通知基盤。期限リマインド等のメール(Resend)+ アプリ内通知の送信、購読設定(ON/OFF)、配信履歴を提供。**Sentry beforeSend / logger の PII マスク (SEC-002 / 論点-005) もここで実装**する。
> **タグ**: cross-cutting, auth-required (購読設定/通知は user-scoped)
> **最終更新**: 2026-05-26
> **入力アーティファクト**: `../../concept.md` (§1.1 UC2 / §3.1 SEC-002 / §4 / §6 / §8 論点-005), `../db/001__shared_db_SPEC.md`, `./README.md`
> **target_type**: cross-cutting (提供インターフェース形式。E2E はスキップ=機能側 E2E でカバー)

---

## 1. 提供インターフェース

### 1.1 通知送信
- `NotificationClient` interface:
  - `sendEmail(userId, template, data)` — 購読 ON かつ quiet_hours 外なら Resend 送信、配信履歴に記録。
  - `createInApp(userId, type, title, body)` — アプリ内通知を作成 (notifications テーブル)。
- `ResendEmailClient` (実装版、Resend SDK 注入)。
- **期待動作**: 送信前に notification_settings を確認 (email_enabled / inapp_enabled / quiet_hours)。OFF なら送らない。

### 1.2 購読設定 (user-scoped、withOwner 経由)
- `getSettings(userId)` / `updateSettings(userId, patch)` — メール/アプリ内 ON/OFF・lead_days・quiet_hours。withOwner(SEC-001) 経由。

### 1.3 アプリ内通知の取得/既読
- `listInApp(userId)` / `markRead(userId, id)` — withOwner 経由。

### 1.4 PII マスク (SEC-002 / 論点-005 の実装)
- `scrubPII(payload)` — メール/Clerk トークン/リクエストボディ(品目名・保管場所)をマスク。
- `sentryBeforeSend(event)` — Sentry の beforeSend に渡すフック。event から PII を除去/マスクしてから送信。
- logger ラッパも scrubPII を通す。**ログ/エラー/コストログに PII を出さない**。

---

## 2. 入出力

### 2.1 提供 API (関数シグネチャ、概念)
| 関数 | 入力 | 出力 | 備考 |
|---|---|---|---|
| `sendEmail(userId, template, data)` | — | 送信結果 | 購読確認 → Resend |
| `createInApp(userId, ...)` | — | 通知 id | notifications 挿入 |
| `getSettings/updateSettings(userId)` | — | settings | withOwner |
| `listInApp/markRead(userId)` | — | — | withOwner |
| `scrubPII` / `sentryBeforeSend` | event/payload | scrub 済 | SEC-002 |

### 2.2 副作用
- DB: notification_settings (読/更新)、notifications (挿入/更新)、delivery 記録。
- 外部: Resend (REST、API キー .env.local サーバー専用、VITE_ 禁止)。
- 通知トリガーは inspection の cron (期限抽出) が本基盤の sendEmail/createInApp を呼ぶ (§5.2)。

---

## 3. データモデル

### 3.1 新規エンティティ (db スキーマ拡張)
> `_shared/db` の核 7 テーブルに加え、本基盤が in-app 通知 + 配信履歴用に追加。db の schema.ts に反映する (cross-feature 拡張)。

#### notifications (アプリ内通知)
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL, INDEX | withOwner 対象 |
| type | text enum('expiry_reminder','inspection','system') | NOT NULL | |
| title / body | text | NOT NULL | PII を含めない (品目名は最小限、保管場所は出さない) |
| read_at | timestamptz | nullable | 既読時刻 |
| created_at | timestamptz | NOT NULL default now() | |

#### email_deliveries (配信履歴、コスト追跡 §4.6 連動)
| フィールド | 型 | 制約 | 備考 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, INDEX | |
| template | text | NOT NULL | 送信種別 |
| status | text enum('sent','failed','skipped') | NOT NULL | skipped=購読OFF/quiet |
| created_at | timestamptz | NOT NULL default now() | Resend 送信数の自前ログ (§4.6.3) |

### 3.2 既存エンティティへの変更
- `notification_settings` (db で定義済) を利用。変更なし。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール |
|---|---|
| lead_days | 1〜90 の整数 |
| quiet_hours | 妥当な time、start<end or 折返し許容 |
| settings 更新 | withOwner で本人のみ |

### 4.2 エラーケース
| ID | 条件 | 振る舞い |
|---|---|---|
| NT-E1 | Resend 送信失敗 | email_deliveries に status=failed 記録、リトライ (淡々と)、PII 非ログ (SEC-002) |
| NT-E2 | 購読 OFF / quiet_hours 内 | 送信せず status=skipped |
| NT-E3 | 無料枠超過予測 (Resend) | 縮退 (§4.6.7、通知頻度を下げる/アプリ内優先) |
| NT-E4 | 他人の settings 更新試行 | withOwner で 0 行 (SEC-001) |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| Resend Free | 3,000 通/月 内 | §4.3。超過予測でアラート (§4.6) |
| PII マスク | メール/トークン/品目名/保管場所をログ・Sentry に出さない | SEC-002 (法令必須) |
| 通知トーン | 淡々・煽らない (「そろそろ点検どうぞ」) | concept §1.1 UC2 / O38 |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| _shared/db | テーブル + withOwner | notification_settings / notifications / email_deliveries |
| inspection | 呼び出し元 | cron が期限抽出 → sendEmail/createInApp を呼ぶ |
| Sentry (監視) | beforeSend | sentryBeforeSend で PII マスク (SEC-002) |

---

## 6. タグ別追加項目

### 6.1 認可 (auth-required / SEC-001)
- 購読設定・アプリ内通知は withOwner(userId) 経由で本人のみ。
- メール送信は cron (システム) から userId 指定で実行、内部的に settings を確認。

---

## 7. スコープ外
- Web Push (concept D-005 で不採用、iOS Safari 不安定)。
- SMS / LINE 通知 (MVP 外)。
- 通知のリッチテンプレート編集 UI (固定テンプレート)。

## 8. 未決事項 (論点リスト)
現時点で論点なし (2026-05-26)。SEC-002 / concept §8 論点-005 (PII ログ漏洩) は本基盤の `scrubPII` / `sentryBeforeSend` / logger ラッパで実装担当 (論点-005 を dispatched-to-feature 扱い)。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (Resend + アプリ内通知 + 購読 + 配信履歴 + SEC-002 PII マスク実装) | /flow:feature |
