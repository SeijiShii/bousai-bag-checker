# _shared/billing E2E テスト計画 (Stripe SDK 実 wiring)

## 1. 変更 UC シナリオ

| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| E-001 | Stripe test key 設定済 | UI 投げ銭ボタン → `/api/billing/checkout` POST → Stripe Checkout URL 返却 | Stripe test checkout 画面が開く |
| E-002 | E-001 で test card `4242 4242 4242 4242` 入力 | Checkout 完了 → success_url リダイレクト | success_url 到達 |
| E-003 | webhook test (Stripe CLI `stripe trigger checkout.session.completed`) | webhook 受信 → 署名検証 → donations 記録 | donations row 1 件追加、stripe_payment_id UNIQUE |
| E-004 | 同 paymentId で重複 webhook | webhook 再送 → idempotent | `recorded` → `duplicate` 返却、row 増えない |

## 2. リグレッションシナリオ
| UC | シナリオ | 確認観点 |
|---|---|---|
| memory mode 既存 18 ジャーニー | local headless | Stripe wiring 追加で破壊なし、全 green 維持 |
| http backend mode で他 API | items / inspections 等 | Clerk auth + Stripe gateway 並走、相互干渉なし |

## 3. 移行検証シナリオ
(なし、DB 移行なし)

## 4. 環境要件差分
| 項目 | 前回 | 今回 | 理由 |
|---|---|---|---|
| Stripe test mode | 未必須 | 必須 (実 Checkout 動作確認時) | gateway が実 Stripe call |
| STRIPE_SECRET_KEY env | 未設定可 | test key 必須 | factory env fail-fast |
| Stripe CLI (`stripe listen`) | 不要 | webhook ローカル受信時に推奨 | webhook E-003 検証 |

## 5. 期待 KPI
- 既存 18 E2E green 維持
- 新 E-001〜004 は **release Phase 2** (実 test key + Stripe CLI listen) で 100% pass
- 実課金 (live key) は **release §3.1 test→live swap** で B-4 確認 (100 円 1 回)

## 6. 実行タイミング
- **ローカル headless (Class A)**: 既存 E2E は memory mode 維持で green
- **実 test key (Class A、release Phase 2)**: 軽めスモークで E-001/002/003 を実機目視
- **実課金 live (Class B-4、release §3.1)**: 1 回まとめ確認

## 7. 更新履歴
| 2026-05-28 | 初版 | /flow:revise |
