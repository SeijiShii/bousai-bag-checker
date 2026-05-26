# inspection 機能仕様書

> **役割**: 期限リマインド(UC2)+ 季節点検モード(UC3)。Vercel Cron で期限が近い品目を抽出して通知トリガー、防災の日等にチェックリスト形式でまとめて点検。
> **タグ**: feature, auth-required, stateful
> **最終更新**: 2026-05-27
> **入力アーティファクト**: `../concept.md` (§1.1 UC2/UC3 / §5.2 / §3.1 SEC), `../inventory`, `../_shared/{db,notification}`, `./README.md`

---

## 1. 詳細 UC（画面別フロー）

### UC2: 期限リマインド(cron)（concept §1.1 #2 由来）
- **トリガー**: Vercel Cron (日次)
- **前提**: items に expires_at / replace_months、notification_settings
- **処理**: 各ユーザーの「lead_days 以内に期限/交換目安が来る items」を withOwner ベースで抽出 → notification.sendEmail / createInApp (購読確認は notification 側)
- **出力**: メール/アプリ内通知 (淡々と「そろそろ点検どうぞ」O38)
- **例外**: 送信失敗は notification 側で処理 (skipped/failed 記録)

### UC3: 季節点検モード（concept §1.1 #3 由来）
- **トリガー**: 点検タブ / 季節通知から
- **前提**: ログイン/ゲスト + items
- **処理**: 全 items をチェックリスト表示 → 各品目を「確認済み/要交換」チェック → 完了で inspection_log 記録 + 「全部グリーン」サマリ
- **出力**: 点検結果サマリ (安心スクショ素材、§4.8.2)、inspection_log
- **例外**: 途中離脱は再開可 (チェック状態の保持)

---

## 2. 入出力

### 2.1 API
| メソッド | パス | 入力 | 出力 | 認証 |
|---|---|---|---|---|
| GET | /api/inspection/due | — | 期限が近い items | requireUser (withOwner) |
| POST | /api/inspection/log | { summary } | inspection_log | requireUser |
| GET | /api/inspection/logs | — | 本人の点検履歴 | requireUser |
| (cron) | /api/cron/expiry-check | (Vercel Cron 認証) | 通知トリガー結果 | Cron シークレット |

### 2.2 画面入力
| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| チェック状態 | per-item bool/enum | – | – | 確認済/要交換 |
| summary | jsonb | ✅ | – | 点検結果 (件数/OK/要交換) |

### 2.3 副作用
- DB: inspection_log 挿入、items 読み取り (withOwner)。通知: notification.sendEmail/createInApp。
- cron: Vercel Cron 日次 → expiry-check。

---

## 3. データモデル
新規エンティティなし。db の `inspection_log` (id/user_id/inspected_at/summary) + `items` (読み取り) を使用。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール |
|---|---|
| cron エンドポイント | Vercel Cron シークレット検証 (外部から叩けない) |
| inspection_log | withOwner で本人のみ |

### 4.2 エラーケース
| ID | 条件 | 状態 | 振る舞い |
|---|---|---|---|
| INS-E1 | cron 未認証アクセス | 401 | 拒否 (Cron シークレット) |
| INS-E2 | 他人の log アクセス | 404 | withOwner (SEC-001) |
| INS-E3 | 通知送信失敗 | – | notification 側で failed 記録、cron は継続 (他ユーザー処理) |
| INS-E4 | items 0件で点検 | – | 「登録された品目がありません」EmptyState |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| cron | 日次、全ユーザー処理がコスト枠内 | §4.6 Resend/Neon 無料枠 |
| 点検ダッシュボード初期表示 | < 1.5s | concept §3 |
| 通知トーン | 淡々・煽らない | O38 / charter |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| inventory | データ参照 | items.expires_at/replace_months/freshness_type |
| _shared/notification | 通知送信 | sendEmail/createInApp + 購読確認 |
| _shared/db | inspection_log / items | withOwner |

---

## 6. タグ別追加項目

### 6.1 認可 (auth-required / SEC-001)
- inspection_log / items は withOwner(userId)。cron は Cron シークレットで保護し、内部的に各 userId で withOwner 実行。

### 6.2 状態遷移 (stateful)
- 季節点検: `未開始 → 点検中(チェック進行) → 完了(log 記録)`。途中離脱は点検中状態を保持して再開可。

---

## 7. スコープ外
- 通知の細かいスケジュール編集 UI (lead_days/quiet_hours は notification 設定で)。
- 点検の他者共有 (家族共有 v2)。
- 避難所連携・位置情報 (concept §1.2 除外)。

## 8. 未決事項 (論点リスト)
現時点で論点なし (2026-05-27)。期限なし品目(check_only)は季節点検チェックリストで「内容確認のみ」として扱う(論点-001 案A と整合)。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (期限リマインド cron + 季節点検モード + inspection_log) | /flow:feature |
