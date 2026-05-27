# AI_LOG セッション D20260527_034 — /flow:release (P4.7 Release gate)

**実行日時**: 2026-05-27 (+09:00)
**コマンド**: /flow:release (Phase 1 env FILL から)
**状態**: 進行中 (Phase 1 = ユーザーの実キー入力待ちで一時停止)
**含まれる decision**: D20260527-088
**起動元**: /flow:auto (D20260526_002)。§4.5.1#0 no-key/Class-A 枯渇 → P4.7 Release gate dispatch
**Resume Contract 準拠** (`--resume` で再開可能、進捗の実体 = `.env.local` 設定済み var + 完了 Phase)

---

## Step 0 検出結果 (Class A)
- デプロイ先: **Vercel** (vercel.json: cron `/api/cron/expiry-check` 日次 + SPA rewrite)
- dev 起動: `scripts/dev.sh` (keyless)
- `.env.local`: **不在** → 実キー全未設定
- 必要 env (`.env.example` SoT):
  - **DB**: DATABASE_URL (Neon)
  - **認証**: VITE_CLERK_PUBLISHABLE_KEY / CLERK_SECRET_KEY (Clerk)
  - **投げ銭**: STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
  - **メール**: RESEND_API_KEY
  - **写真(任意)**: R2_*（ACCOUNT_ID/ACCESS_KEY_ID/SECRET_ACCESS_KEY/BUCKET）
  - **監視**: SENTRY_DSN / VITE_SENTRY_DSN
  - **cron 保護**: CRON_SECRET (生成可、Class A)
  - **レート制限(任意)**: UPSTASH_REDIS_REST_*
  - **service-hub**: SERVICE_INFO_TOKEN

## Phase 1 = Class C 境界 (一時停止理由)
実キー値は人間しか持たない (Clerk/Stripe/Resend/Neon/R2/Sentry のダッシュボードで取得)。autonomous loop はここで正当に停止し、ユーザーの主導を待つ (auto-pick-policy §1.5.5「Class C 本質入力 = 唯一停止すべきパターン」)。

## release 段に残る code 配線 (O35 で意図的に deferred、実キー取得と並行)
- **Clerk セッション検証**: `api/_lib/composition.ts` の `releaseSessionResolver` が現在 throw。実 Clerk SDK (`@clerk/backend` 等) を install し SessionResolver を実装
- **Stripe ゲートウェイ**: `makeApiCore` の `gateway` 未注入 → tip/webhook 501。実 Stripe gateway を実装・注入
- **Resend sender**: `makeApiCore` の `sender` 既定 no-op → 実 Resend sender を実装・注入
- **Sentry beforeSend**: scrubPII は実装済 (notification/pii)、実 Sentry init は VITE_SENTRY_DSN 設定時に配線
- これらは Class A だが**実キーが無いと結合検証できない**ため release 工程で実施

## ここまでの完了状態 (autonomous で到達)
- 全 11 ターゲット unit 実装 (136 unit green) / app shell bootstrap (keyless 起動・build OK)
- P4.4(b) 視覚デザインレビュー green / P4.5 E2E 11 spec green
- → **残るは本 Release のみ**

## 次 (ユーザー主導で再開時)
1. Phase 1: 実キー FILL (`/flow:release --fill-only` or フル)。CRON_SECRET は生成提案
2. release SDK 配線 (Clerk/Stripe/Resend) → 実キーで結合
3. Phase 2: `scripts/dev.sh` + スマホ実機で課金系含む正常系を軽く目視
4. Phase 3: Vercel preview deploy → 確認 → prod promote (Class B 明示確認)。デプロイ先 env に secret 反映 + O51 `/api/*` 起動検証
5. 公開後: `/flow:promote` で告知文面 (任意)

---

## decisions

### D20260527-088
- question: P4.7 Release gate 到達時の進め方
- chosen: no-key/Class-A 枯渇を確認し /flow:release を dispatch。Phase 1(実キー=Class C)+ deferred SDK 配線 + デプロイ(Class B)はユーザー主導が必要 → 検出のみ実施し一時停止
- chosen_type: explicit-choice (Class C/B 境界、ユーザー判断待ち)
- context: 全 autonomous 作業(unit/bootstrap/design/E2E)完了。実キーは人間のみ保有、実課金+公開デプロイは本人判断。.env.local 不在で全キー未設定
- depends_on: [D20260527-087]
