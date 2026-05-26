# _shared/billing 仕様書 (横断基盤)

> **役割**: 投げ銭基盤。Stripe で 100 円の任意支援(one-time)を受け、webhook で donation を記録する。**機能アンロックは伴わない**(社会善アプリ、全機能無料 — D-028)。
> **タグ**: cross-cutting
> **最終更新**: 2026-05-27
> **入力アーティファクト**: `../../concept.md` (§1.1 UC6 / §4 / §5 donation / §6 Stripe / §9.4 / §3.1 SEC), `../db/001__shared_db_SPEC.md`, `./README.md`
> **target_type**: cross-cutting (Checkout + webhook 提供。E2E はスキップ=投げ銭フローは機能側 E2E + release の実キースモークでカバー)

---

## 1. 提供インターフェース

### 1.1 投げ銭 Checkout
- `createTipCheckout({ userId? })` — Stripe Checkout Session (mode=payment, amount=100円固定) を作成し URL を返す。ログイン不要 (userId は任意、ログイン時のみ donation に紐付け)。
- **機能アンロックなし**: 成功しても plan/権限は変わらない (D-028)。完了画面で「ご支援ありがとうございます」(O38 トーン)。

### 1.2 Webhook 処理
- `handleStripeWebhook(rawBody, signature)` — **署名検証必須** (STRIPE_WEBHOOK_SECRET)。`checkout.session.completed` で donation 行を作成 (冪等: stripe_payment_id UNIQUE)。
- 検証失敗は 400、PII 非ログ (SEC-002)。

### 1.3 支援集計 (任意、§4.6)
- `getTipTotal()` — donation 累計 (任意記録、運用確認用)。PII を含めない。

---

## 2. 入出力

### 2.1 API
| メソッド | パス | 入力 | 出力 | 認証 |
|---|---|---|---|---|
| POST | /api/tip/checkout | { userId? } | { checkoutUrl } | 不要 (ゲスト可) + レート制限 |
| POST | /api/stripe/webhook | raw body + Stripe-Signature | 200/400 | Stripe 署名検証 |

### 2.2 副作用
- DB: donations 挿入 (webhook 経由)。
- 外部: Stripe (Checkout Session 作成 + webhook、API キー .env.local サーバー専用、VITE_ 禁止=SEC-005)。

---

## 3. データモデル
新規エンティティなし。`_shared/db` の `donations` (id/user_id?/stripe_payment_id/amount=100/created_at) を使用。**機能アンロック用カラムは持たない** (D-028)。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール |
|---|---|
| amount | 100 円固定 (サーバー側で固定、クライアントから金額を信用しない) |
| webhook | Stripe 署名検証必須 |
| checkout レート | IP 単位 N req/min (公開エンドポイント、SEC-004) |

### 4.2 エラーケース
| ID | 条件 | 振る舞い |
|---|---|---|
| BL-E1 | webhook 署名検証失敗 | 400、処理しない、PII 非ログ (SEC-002) |
| BL-E2 | 同一 stripe_payment_id 重複 webhook | UNIQUE で冪等吸収 (二重記録しない) |
| BL-E3 | Stripe 障害/到達不可 | Checkout 作成失敗を淡々と表示 (O38)、リトライ案内 |
| BL-E4 | checkout レート超過 | 429 |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| 金額 | 100 円固定 (サーバー強制) | D-028、§9.4 |
| webhook 冪等性 | stripe_payment_id UNIQUE | BL-E2 |
| PII | donation に PII を持たない (user_id 任意のみ) | SEC-002 / O48 |
| 課金安全 | test モード優先、Live 鍵は release で注意 | charter 課金安全 |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| _shared/db | donations 挿入 | webhook で記録 |
| _shared/legal | 投げ銭前確認 + 特商法/投げ銭表記 | 任意性・返金不可の明示 (O43) |
| _shared/ui | 投げ銭ボタン + 完了画面 | design-system トークン |

---

## 6. タグ別追加項目
cross-cutting。投げ銭はログイン不要 (auth 任意連携)。

---

## 7. スコープ外
- 継続課金 / サブスクリプション (D-028、単発のみ)。
- 機能アンロック / プラン階層 (全機能無料、D-028)。
- 任意金額入力 (100 円固定。将来要望あれば revise)。
- 返金処理 UI (原則返金不可、§9.4。例外は Stripe ダッシュボードで手動)。

## 8. 未決事項 (論点リスト)
現時点で論点なし (2026-05-27)。課金モデルは D-028 (100円投げ銭・機能アンロックなし) で確定。特商法該当性の最終確認は legal の論点-S-legal-1 で追跡。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (Stripe 100円 one-time Checkout + webhook 署名検証 + donation 記録、機能アンロックなし) | /flow:feature |
