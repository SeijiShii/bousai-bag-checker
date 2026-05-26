<!-- auto-generated-start -->
# 設計レビューレポート — feedback

**レビュー日**: 2026-05-27
**レビュー実施者**: Claude (Opus 4.7) + seiji
**対象**: feedback (機能)
**入力**: docs/feedback/001-004 + concept.md + _shared/{db,notification,ui}
**観点ソース**: 組み込みチェックリスト + ~/.claude/review-perspectives.md (P1-P9)
**モード**: auto-pick / **前提**: greenfield (実コードなし) → 設計間整合・再利用・責務を中核

## 1. レビューサマリー
| 観点 | 評価 | 備考 |
|---|---|---|
| 仕様の明確性 | OK | 👍/👎+バグ報告、ゲスト送信 |
| 既存実装の再利用 | 要確認→確定 | scrubPII(notification) 再利用、rate-limit/bot 共通化 (R1) |
| API 流用・責務逸脱 | OK | scrubPII の所有者=notification |
| 権限・認可 | OK | ゲスト送信=公開、レート制限/bot(SEC-004) |
| テストカバレッジ | OK | PII scrub + レート制限/bot 重点 |

## 2. 指摘事項

### [R1] レート制限/bot 対策を _shared 共通ミドルウェアに (severity=Medium, P2)
- **対象**: feedback `/api/feedback` + billing `/api/tip/checkout` + service-info `/api/service-info`
- **問題**: 公開エンドポイントのレート制限が **3 機能で必要** (feedback/tip/service-info)。各々で実装すると P2(重複)。
- **推奨**: **`_shared` (db or 新規 `src/services/ratelimit/`) に共通レート制限ヘルパ + bot(Turnstile/honeypot) 検証を 1 箇所**にまとめ、各公開エンドポイントが適用。Upstash Ratelimit 等。
- **chosen**: 共通レート制限ヘルパを _shared 化、feedback/tip/service-info で共有
- **反映先**: 002 §6 にコメント (+ 横断的に billing/service-info も同ヘルパ参照)

### [R2] scrubPII は notification の単一所有を import (severity=Low, 再利用)
- **推奨**: feedback は notification の `scrubPII` を import (再実装しない)。feedbackSchema は単一ソース。
- **chosen**: scrubPII import (notification 所有)、feedbackSchema 単一ソース
- **反映先**: 002 (既に notification 依存記載) + コメント

### [R3] analytics イベントの PII 非混入を型で担保 (severity=Low)
- **推奨**: feedback_submitted イベントの型に PII フィールドを持たせない (型レベルで防止)。GA4 不採用(concept §6)。
- **chosen**: イベント型に PII を含めない

## 3. コードベース調査結果
- greenfield。公開エンドポイントのレート制限/bot が feedback/tip/service-info で共通必要 → R1 で共通化。
- 責務: scrubPII=notification 所有、feedback は利用側 (逸脱なし)。

## 4. 設計判断ログ
| # | 判断項目 | 結論 | type | 反映先 |
|---|---|---|---|---|
| D1(R1) | レート制限/bot | _shared 共通ヘルパ化 | auto-recommended | 002 + 横断 |
| D2(R2) | scrubPII/schema | 単一所有 import | auto-recommended | 002 |
| D3(R3) | analytics PII | 型で非混入 | auto-recommended | 001 |

## 5. 次のステップ
- `/flow:tdd feedback` で実装着手。共通レート制限ヘルパ(R1)は最初の公開エンドポイント実装時に _shared へ。
<!-- auto-generated-end -->
