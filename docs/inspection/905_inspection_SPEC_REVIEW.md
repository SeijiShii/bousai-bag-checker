<!-- auto-generated-start -->
# 設計レビューレポート — inspection

**レビュー日**: 2026-05-27 / **実施**: Claude (Opus 4.7) + seiji
**対象**: inspection / **入力**: docs/inspection/001-004 + concept + inventory/notification/db
**観点**: 組み込み + review-perspectives P1-P9 / **モード**: auto-pick / **前提**: greenfield

## 1. サマリー
| 観点 | 評価 | 備考 |
|---|---|---|
| 既存実装の再利用 | OK→確定 | dueItems は inventory.freshness を import(再実装禁止、R1) |
| API 流用・責務逸脱 | OK | freshness=inventory所有、通知=notification所有、inspection は利用側 |
| 影響範囲 | OK | cron が全ユーザー処理、1ユーザー失敗で継続(設計済) |
| 権限・認可 | OK | withOwner + Cron シークレット |

## 2. 指摘事項
### [R1] dueItems は inventory.freshness を import (severity=Medium, P2)
- **推奨**: 期限抽出ロジックを inspection で再実装せず、inventory の freshness を import (lead_days 連動も inventory 側 R4 と一致)。
- **chosen**: inventory.freshness import (重複禁止)
- **反映先**: 002 §3 (依存記載済) + コメント

### [R2] cron の冪等性/多重起動耐性 (severity=Medium, P9 類似)
- **問題**: Vercel Cron が稀に多重起動した場合、同日に通知が二重送信されないか。
- **推奨**: 通知送信前に「当日同 item の通知済み」を email_deliveries で確認 or 冪等キーで抑制。
- **chosen**: email_deliveries で当日重複送信を抑制 (冪等)
- **反映先**: 001 §4.2 + 002 §6 にコメント

### [R3] 通知本文に保管場所等 PII を含めない (severity=Low, SEC-002 再確認)
- **推奨**: 通知は「○○がそろそろ点検時期」程度、保管場所は含めない。
- **chosen**: 通知本文の PII 最小化

## 3. コードベース調査
- greenfield。inspection は inventory(freshness)/notification(sender)/db(inspection_log) の利用側、責務逸脱なし。
- cron 多重起動の冪等性を R2 で補強。

## 4. 設計判断ログ
| # | 判断 | 結論 | type | 反映先 |
|---|---|---|---|---|
| D1(R1) | freshness 再利用 | inventory import | auto-recommended | 002 |
| D2(R2) | cron 冪等 | email_deliveries で重複抑制 | auto-recommended | 001/002 |
| D3(R3) | 通知 PII | 最小化 | auto-recommended | 001 |

## 5. 次のステップ
- `/flow:tdd inspection` で実装。R2(冪等)を cron Phase で実装。
<!-- auto-generated-end -->
