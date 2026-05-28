<!-- auto-generated-start -->
# 設計レビューレポート — _shared/notification revise_001 Resend SDK 実 wiring

**レビュー日**: 2026-05-28
**モード**: auto-pick (--auto)
**severity-threshold**: low

## 1. レビューサマリー

| 観点 | 評価 | 備考 |
|---|---|---|
| 仕様の明確性 | OK | factory signature / ResendConfig / env 要件明確 |
| 既存パターンとの一貫性 | OK | O35 inject seam (auth/billing と同形 pattern、3 つ目) |
| API 設計 | OK | factory + Config パターン |
| エラーハンドリング | OK | result.error → throw (PII なし、name のみ)、data.to 不在 → guard throw |
| テストカバレッジ | OK | 5 ケース (送信成功/error/data.to 不在/subject 省略/factory 生成) |
| 影響範囲・副作用 | OK | composition.ts seam 1 箇所、EmailSender interface 不変 |
| API 流用・責務逸脱 | OK | factory は Resend API adapter のみ |
| 既存実装の再利用 | OK | EmailSender / makeNotification 全て再利用 |
| データ移行・互換性 | OK | 不要 |
| 学習済み観点 P1-P5 | N/A | 本 revise scope 外 |

**結論**: 同形 pattern 3 つ目、Info 級 1 件のみ。

## 2. 指摘事項

### [R1] Info: `resend` バージョン pin 明示

- **対象**: `002_REVISE_PLAN.md` §5 Phase 1
- **現状**: 「バージョン: `^4.x.x` (現行安定版、ESM 対応)」 — 既に明示済 ✅
- **問題**: なし (auth R2 / billing R1 で学習した pattern を最初から適用)
- **判定**: 反映不要、既に十分な明示あり
- **種別**: 確認のみ
- **chosen**: 現状維持
- **反映先**: なし

## 3. コードベース調査結果

### 3.1 既存パターン
- auth revise_001 + billing revise_001 で確立した factory + vi.hoisted mock pattern を完全踏襲
- mock の作り方も同型: `vi.hoisted` で SDK class mock 化、test で send 各分岐検証

### 3.2 影響範囲
- composition.ts: gateway/sender 並列で seam 注入 = 影響範囲限定
- makeNotification.ts: EmailSender interface 不変、既存 test の mock pattern と整合

### 3.3 責務評価
- 責務逸脱なし、流用懸念なし

## 4. 設計判断ログ
| # | 判断項目 | 結論 | chosen_type |
|---|---|---|---|
| (なし) | 全体設計が auth/billing と同形のため設計判断項目なし | - | - |

## 5. 次のステップ
- `/flow:tdd _shared/notification/revise_001_20260528_resend-sdk-wiring` で実装着手
- 完了後 composition.ts の SDK seam (Clerk/Stripe/Resend) 3/3 全完成

<!-- auto-generated-end -->
