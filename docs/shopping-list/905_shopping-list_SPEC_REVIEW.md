<!-- auto-generated-start -->
# 設計レビューレポート — shopping-list

**レビュー日**: 2026-05-27 / **実施**: Claude (Opus 4.7) + seiji
**対象**: shopping-list / **入力**: docs/shopping-list/001-004 + concept + inventory/db/ui
**観点**: 組み込み + review-perspectives P1-P9 / **モード**: auto-pick / **前提**: greenfield

## 1. サマリー
| 観点 | 評価 | 備考 |
|---|---|---|
| 既存実装の再利用 | OK→確定 | 期限切れ/不足抽出は inventory.freshness を import(R1) |
| 既存実装の再利用 | OK | CSV エスケープは本機能のみが使用(共通化不要、単一利用) |
| 権限・認可 | OK | shopping_item を withOwner(SEC-001) |
| 課金 | OK | **無料**(D-028、課金ゲートなし)を E2E UC4-S6 で確認 |
| データ整合 | 要確認→確定 | generate の重複防止(R2、P5 類似) |

## 2. 指摘事項
### [R1] 期限切れ/不足抽出は inventory.freshness を import (severity=Medium, P2)
- **推奨**: generate.ts は inventory の freshness を import (expired/insufficient 判定を再実装しない)。
- **chosen**: inventory.freshness import
- **反映先**: 002 §3 (依存記載済) + コメント

### [R2] generate の重複生成防止 (severity=Medium, P5/データ整合)
- **問題**: 「リスト生成」を複数回押すと同じ item が shopping_item に二重生成されないか。
- **推奨**: generate は **既存の未購入 shopping_item (同 item_id/reason) とマージ**し、重複を作らない (upsert 的)。
- **chosen**: 既存未購入とマージして重複防止
- **反映先**: 001 §1 UC4 + 002 §6 にコメント

### [R3] CSV インジェクションエスケープは単一実装で十分 (severity=Info)
- CSV エクスポートは shopping-list のみ。共通化不要 (単一利用、過度な抽象化を避ける)。SEC-003 エスケープは csvExport.ts に閉じる。

## 3. コードベース調査
- greenfield。shopping-list は inventory(freshness)/db(shopping_item)/ui の利用側。CSV は単一利用。
- generate の冪等性(重複防止)を R2 で補強。

## 4. 設計判断ログ
| # | 判断 | 結論 | type | 反映先 |
|---|---|---|---|---|
| D1(R1) | freshness 再利用 | inventory import | auto-recommended | 002 |
| D2(R2) | generate 重複防止 | 既存未購入とマージ | auto-recommended | 001/002 |
| D3(R3) | CSV エスケープ | 単一実装(共通化不要) | auto-recommended | — |

## 5. 次のステップ
- `/flow:tdd shopping-list` で実装。R2(マージ)を generate Phase で実装。
<!-- auto-generated-end -->
