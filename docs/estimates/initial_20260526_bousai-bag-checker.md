---
generated_at: 2026-05-26 20:25
generator: /flow:estimate
context: whole
source_input: ../concept.md
interpreted_as:
  feature: null
  phase: rough
  source: autodetect
phase: rough
confidence_band:
  ai_impl: "±300%"
  human_bottleneck: "±50%"
  ai_tokens: "±50%"
nfr_profile:
  scale: low
  throughput: low
  latency: standard
  availability: none
  source: explicit   # concept §3 NFR より
  combined_multiplier: 0.5x   # 0.7(scale) × 0.8(throughput) × 1.0(latency) × 0.9(avail)
calibration:
  pj_internal: none           # docs/AI_LOG/STATS.md なし
  global_metrics: empty        # global-metrics.jsonl 0 行
  applied: default係数 100%    # 実績なし → デフォルト、band は rough デフォルト
summary:
  min:
    total_files: 50
    total_lines: 2200
    human_hours: 8
    ai_tokens_total_k: 550
  standard:
    total_files: 115
    total_lines: 4800
    human_hours: 16
    ai_tokens_total_k: 1200
  full:
    total_files: 230
    total_lines: 10500
    human_hours: 30
    ai_tokens_total_k: 2300
---

# 見積もり: 持ち出し袋チェッカー (全体・初回 rough)

> **phase=rough** (concept のみ、SPEC 未生成)。AI-impl コード量は **±300%** の広い band。Phase 2 で最初の 1 feature 完了後に `/flow:estimate` 2 回目で refined に再校正される (SCENARIO §3 標準)。
> **金額換算は利用側に委ねる** (コード量 × AI コーディングレート、トークン × モデル単価)。

## サマリ表

| スコープ | ファイル数 | コード行数 (logic+test) | 人間時間 | AI 推論トークン (設計+実装) |
|---|---|---|---|---|
| Minimum | ~50 | ~2,200 | ~8h | 設計 ~150K / 実装 ~400K = **~550K** (±50%) |
| Standard | ~115 | ~4,800 | ~16h | 設計 ~280K / 実装 ~920K = **~1.2M** (±50%) |
| Full | ~230 | ~10,500 | ~30h | 設計 ~450K / 実装 ~1.85M = **~2.3M** (±50%) |

> **confidence band**: AI-impl ±300% (rough) / Human-bottleneck ±50% / AI トークン ±50% (実装込み)
> **NFR プロファイル**: scale=low, throughput=low, latency=standard, availability=none (source=explicit, 合成倍率 **0.5x**) — 個人ツール・低頻度・無料枠厳守を反映してコード量を圧縮
> **キャリブレーション**: PJ 内実績なし + global-metrics 空 → デフォルト係数 100%、band は rough デフォルト

## 1. 機能フォルダ別ブレークダウン (NFR 適用後、Standard 基準)

| フォルダ | 主タスク | task_type | classification | Std files | Std lines |
|---|---|---|---|---|---|
| inventory | 品目 CRUD 一覧/フォーム + 写真(R2) + カテゴリ別期限/交換目安(論点-001) | ui_code/api_code/db/unit/e2e_auto | ai_impl | 13 | 1,050 |
| inspection | 期限リマインド + 季節点検モード + cron トリガー | ui_code/api_code/unit/e2e_auto | ai_impl | 11 | 850 |
| shopping-list | 買い物 TODO リスト生成 + 購入チェック + 課金ゲート + CSV 共有 | ui_code/api_code/unit/e2e_auto | ai_impl | 9 | 700 |
| feedback | 👍/👎 + バグ報告ウィジェット + PII scrub + rate limit | ui_code/api_code/unit | ai_impl | 7 | 420 |
| **小計** | | | | **40** | **3,020** |

**根拠**: inventory が最大 (CRUD + 写真 + カテゴリ別鮮度ロジック、他機能の参照元)。shopping-list は有料機能で課金ゲート分が乗る。E2E は Playwright 自動化前提 (perspectives O33)。

## 2. 横断フォルダ別ブレークダウン (NFR 適用後、Standard 基準)

| フォルダ | 主タスク | is_new | Std files | Std lines |
|---|---|---|---|---|
| _shared/db | Drizzle スキーマ 7 テーブル (user/item/notification_setting/inspection_log/billing/shopping_item/feedback) + マイグレーション + 接続 + withOwner ラッパ(SEC-001) | true | 8 | 560 |
| _shared/ui | shadcn/ui + Tailwind + design-system トークン + 基本コンポーネント | true | 12 | 720 |
| _shared/auth | Clerk ゲスト→段階的認証 + middleware + 所有者強制(SEC-001) | true | 7 | 480 |
| _shared/notification | Resend + アプリ内通知 + 購読 ON/OFF + 配信履歴 + Sentry beforeSend PII マスク(SEC-002) | true | 9 | 640 |
| _shared/billing | Stripe 100円 one-time + webhook 署名検証 + アンロック + ゲート | true | 8 | 560 |
| _shared/service-info | /api/service-info 集計エンドポイント (契約 SoT=service-hub、論点-003) | true | 3 | 230 |
| _shared/legal | privacy/terms/特商法 静的ページ + フッタ導線 + 免責 | true | 5 | 280 |
| **小計** | | | **52** | **3,470** |

**根拠**: db/ui/auth/notification が基盤投資。billing は新規(有料機能の中核)。legal は内容物中心で行数の割にロジック少。service-info は契約確定後に最小実装。

## 3. 基本部分 (新規 PJ、Standard 基準)

| # 項目 | 内容 | classification | Std files | Std lines |
|---|---|---|---|---|
| #1 PJ 初期化 | Vite+React+TS / Vercel / tsconfig / eslint・prettier | ai_impl | 9 | 360 |
| #5 テスト基盤 | vitest + Playwright 設定 | ai_impl | 4 | 180 |
| #3 エラー/ログ | Sentry 設定 + 構造化ログ + コストログ(§4.6) | ai_impl | 5 | 280 |
| #7 CI/CD | GitHub Actions (lint/test) + Vercel preview + Dependabot | ai_impl | 4 | 180 |
| #9 監視 | Sentry ヘルスチェック + 無料枠超過アラート | ai_impl | 3 | 200 |
| PWA | manifest + service worker + OGP/構造化データ | ai_impl | 4 | 200 |
| 環境/秘密 | .env.example + gitleaks pre-commit (O25) | ai_impl | 3 | 80 |
| i18n | なし (国内向け JA 単一) | — | 0 | 0 |
| a11y | Std=WCAG A 基本 (UI コンポーネントに内包) | — | 0 | 0 |
| **小計** | | | **32** | **1,480** |

## 4. NFR 倍率の効き

| NFR 軸 | 値 | 倍率 | 影響 |
|---|---|---|---|
| scale | low | 0.7x | 品目数十〜100件/世帯、データ小 |
| throughput | low | 0.8x | 年数回〜月数回の低頻度利用 |
| latency | standard | 1.0x | CRUD <300ms p95 |
| availability | none | 0.9x | 個人ツール SLA なし、無料枠準拠 |
| **合成** | | **0.5x** | コード量を約半分に圧縮 |

> pre-NFR Standard 合計 ≈ 135 files / 8,830 lines → NFR 0.5x(lines 中心)+ files 緩め適用で **~115 files / ~4,800 lines**。

## 5. 人間ボトルネック (Human-bottleneck、±50%)

| 項目 | classification | Std hours | 自動化不可の理由 |
|---|---|---|---|
| スマホ実機での通知/写真/UI 触感確認 | human_bottleneck | 4h | デバイス固有・触感は自動化代替不可 (Windows/WSL2 port-forward) |
| Stripe 100円 実課金スモーク (test→live) | human_bottleneck | 2h | 実課金フローの人間確認 (B-4)、Live 鍵注意 |
| 視覚デザインレビュー (/flow:design) の最終目視 | human_bottleneck | 2h | 視覚微細差異・世界観適合の人間判断 |
| 法務コピー (privacy/terms/特商法) のレビュー | human_bottleneck | 3h | 法令文言の人間確認 |
| デプロイ確認 (Vercel preview→本番、DNS サブドメ) | human_bottleneck | 3h | 本番反映の最終確認 (Class B) |
| API キー取得/設定 (Clerk/Neon/R2/Resend/Stripe/Sentry) | human_bottleneck | 2h | provider アカウント・実キーは人間のみ |
| **小計** | | **~16h** | |

## 6. AI 推論トークン量フェルミ推定 (Step 11.5)

**設計フェーズ (Std, 全設計サイクル)**:
- concept NEW 13K + 課金 update 6K + secure design 11K(済) + pre-impl 8K + deps 7K
- feature × 11 対象 (機能4 + 横断7) × ~10K = 110K
- spec-review × 11 × ~6K = 66K
- design 15K + estimate × 2 ~12K + audit (light×1 13K + full×1 33K)
- 合計 ≈ **280K tokens** (±30%)

**実装フェーズ (Std)**: 経験則の per-session 実測 (tdd ~80-110K tokens/対象) を採用 (`code_lines × 1.5 × loop_factor` の式は input context を過小評価するため)。11 対象 × ~80K + E2E 11 × ~ある程度 ≈ **~920K tokens** (±50%)。

> Min は対象を絞る (機能の Min スコープ + 横断は基盤のみ) ため ~550K、Full は a11y AA + フル E2E + runbook で ~2.3M。

## 7. 根拠サマリ

1. **NFR が効いている**: 個人ツール・低頻度・無料枠厳守 (concept §3) で合成 0.5x。同規模でも商用 SaaS なら倍以上。
2. **基盤投資が先行 (横断 52 files)**: db/ui/auth/notification/billing を P1-P3 で先に作るため、序盤は機能より横断のコード比率が高い。
3. **shopping-list が唯一の有料機能**: 課金ゲート + 購入管理 (shopping_item) 分が乗るが、PDF 廃止で出力系は CSV 共有のみに簡素化。
4. **セキュリティ要件 (SEC-001/002) がコードに反映**: withOwner 所有者強制 (db/auth) + Sentry beforeSend PII マスク (notification) を Std から織り込み済。
5. **人間時間 ~16h の過半が実機/実課金/法務/デプロイ**: コード量と非相関のボトルネック。

## 8. 二重計上回避

全体見積もりのため二重計上なし。各横断は is_new=true (新規 PJ、既存設計なし)。Phase 2 の feature 個別見積もり時に、依存する横断 (例: shopping-list → billing) を `is_new=false` で計上ゼロにする。
