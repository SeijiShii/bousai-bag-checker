# inspection 実装計画書

> **入力**: `./001_inspection_SPEC.md`, `../concept.md` §1.4 / §4.3 / §5.2
> **最終更新**: 2026-05-27

---

## 1. 実装対象ファイル一覧 (src/features/inspection/)

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `dueItems.ts` | lead_days 以内の期限/交換目安 items 抽出 | db, inventory(freshness) | 80 |
| `api/cron/expiry-check.ts` | Vercel Cron: 全ユーザー期限抽出 → 通知トリガー。**多重起動耐性: email_deliveries で当日同 item の重複送信を抑制(冪等)** <!-- spec-review R2: cron 冪等性 --> | db, notification | 90 |
| `dueItems.ts` (再掲) | **inventory.freshness を import(再実装禁止)** <!-- spec-review R1 --> | inventory(freshness) | — |
| `api/inspection/log.ts` / `due.ts` / `logs.ts` | 点検 API (withOwner) | db | 90 |
| `InspectionDashboard.tsx` | 点検ダッシュボード (鮮度サマリ) | ui, inventory | 110 |
| `InspectionChecklist.tsx` | 季節点検チェックリスト + 完了サマリ | ui | 130 |
| `useInspection.ts` | フック | — | 50 |

## 2. 実装 Phase 分割 (/flow:tdd 連携)

### Phase 1 (RED→GREEN→IMPROVE): dueItems 抽出ロジック
- 対象: `dueItems.ts` (inventory の freshness を流用)
- テスト対象: lead_days 以内の expiry/replace_guide 抽出、check_only は除外、withOwner
- ゴール: 期限抽出が正しい (純ロジック + mock db)

### Phase 2: cron + inspection API
- 対象: `api/cron/expiry-check.ts` + `api/inspection/*`
- テスト対象: Cron シークレット検証、全ユーザー処理、notification トリガー(mock)、log 記録(withOwner)、他人 log で 404
- ゴール: cron + 点検 API が認可 + 通知で通る

### Phase 3: UI (Dashboard/Checklist)
- 対象: 点検ダッシュボード + チェックリスト + 完了サマリ
- テスト対象: 鮮度サマリ表示、チェック進行→完了で log 記録、「全部グリーン」、EmptyState
- ゴール: 点検 UI が render + 操作。視覚は /flow:design --review-only

### Phase 3.5: bootstrap
- `vercel.json` に Cron 設定 (日次)。`.env.example` に `CRON_SECRET` 追記。

## 3. 依存関係順序
```
inventory(freshness) + db + notification → dueItems → cron/api → UI
```
依存先: inventory/db/notification (設計済)。

## 4. 既存ファイルへの影響
- BottomNav に点検タブ。vercel.json に Cron。

## 5. 横断フォルダへの追加・変更
| 横断フォルダ | 追加・変更内容 |
|---|---|
| _shared/notification | cron から sendEmail/createInApp 呼び出し |
| _shared/db | inspection_log 挿入、items 読み取り |

## 6. リスク・注意点
- **cron 認可** (INS-E1): Vercel Cron シークレットで保護。外部から叩けないように。
- **コスト** (§4.6): 全ユーザー日次処理。Resend 無料枠超過予測で縮退 (通知頻度↓/アプリ内優先)。
- **SEC-001/002**: withOwner + 通知本文に保管場所等の PII を最小化。
- 通知トーン O38 (「そろそろ点検どうぞ」)、煽らない。

## 7. 完了の定義 (DoD)
- [ ] dueItems が lead_days 抽出 (freshness 種別考慮)
- [ ] cron が Cron シークレット保護 + 全ユーザー通知トリガー
- [ ] inspection API が withOwner + log 記録
- [ ] 点検ダッシュボード + チェックリスト + 完了サマリ
- [ ] 単体テストカバレッジ 80%/70%
- [ ] E2E (004) は /flow:e2e で green

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (dueItems→cron/api→UI の 4 Phase) | /flow:feature |
