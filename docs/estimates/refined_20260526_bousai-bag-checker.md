---
generated_at: 2026-05-26 20:36
generator: /flow:estimate
context: whole
source_input: ../concept.md + ../_shared/db/{001,002,003}
interpreted_as:
  feature: null
  phase: refined
  source: arg ("refined")
phase: refined
confidence_band:
  ai_impl: "±100%"
  human_bottleneck: "±50%"
  ai_tokens: "±50%"
nfr_profile:
  scale: low
  throughput: low
  latency: standard
  availability: none
  source: explicit
  combined_multiplier: 0.5x
calibration:
  pj_internal: none           # docs/AI_LOG/STATS.md なし (実装メトリクス未蓄積)
  global_metrics: empty        # global-metrics.jsonl 0 行
  applied: default係数 100%    # 実績なし → デフォルト。band は refined デフォルト (N<5 で縮小なし)
  refined_from: initial_20260526 (rough ±300%)
  concrete_input: _shared/db 設計 (001-003) の実ファイル数/LOC
summary:
  min:
    total_files: 55
    total_lines: 2600
    human_hours: 8
    ai_tokens_total_k: 600
  standard:
    total_files: 128
    total_lines: 5400
    human_hours: 16
    ai_tokens_total_k: 1300
  full:
    total_files: 250
    total_lines: 11800
    human_hours: 30
    ai_tokens_total_k: 2450
---

# 見積もり: 持ち出し袋チェッカー (全体・refined)

> **phase=refined** (±100%)。initial rough (±300%) を `_shared/db` の具体設計 (001-003) + 投げ銭簡素化 (D-028) で再校正。
> **db のみ具体データ点**。他 10 ターゲットは concept 由来の rough を db の実績比率で微調整。実装メトリクス蓄積後は calibrated に進む。

## サマリ表

| スコープ | ファイル数 | コード行数 (logic+test) | 人間時間 | AI 推論トークン (設計+実装) |
|---|---|---|---|---|
| Minimum | ~55 | ~2,600 | ~8h | 設計 ~160K / 実装 ~440K = **~600K** (±50%) |
| Standard | ~128 | ~5,400 | ~16h | 設計 ~300K / 実装 ~1.0M = **~1.3M** (±50%) |
| Full | ~250 | ~11,800 | ~30h | 設計 ~480K / 実装 ~1.97M = **~2.45M** (±50%) |

> **confidence band**: AI-impl **±100%** (refined、rough ±300% から収束) / Human-bottleneck ±50% / AI トークン ±50%
> **NFR**: scale=low/throughput=low/latency=standard/availability=none (explicit、合成 0.5x)
> **キャリブレーション**: PJ 内実績なし + global-metrics 空 → デフォルト係数、band 縮小なし (N<5)

## 1. initial(rough)からの変化と根拠

| 項目 | initial (rough) | refined | 差分根拠 |
|---|---|---|---|
| Std ファイル数 | ~115 | ~128 | _shared/db の具体設計が 9-10 ファイル (rough 想定 8 より +) と判明 → 全体に +約11% |
| Std 行数 | ~4,800 | ~5,400 | db PLAN/UNIT の実 LOC (logic ~480 + test ~250 = ~730、rough 想定 560 より +30%) を反映、他 cross-cutting も同傾向で微増 |
| 課金 (billing) | 買い切り(アンロック判定) | **投げ銭(donation 記録 + Checkout)** | D-028 で簡素化 → billing は -約40% (アンロック・gate ロジック不要)。shopping-list も課金ゲート消滅で微減。全体増を一部相殺 |
| confidence band | ±300% | **±100%** | refined フェーズ。db が具体データ点になり不確実性低下 |

> 純差分: db/他基盤の上方修正 (+) と投げ銭簡素化 (−) が部分相殺し、Std は ~115→~128 ファイルの小幅増。**主な refined の価値は band を ±300%→±100% に収束**させたこと。

## 2. _shared/db 具体実績 (refined の根拠データ点)

`002_PLAN` / `003_UNIT_TEST` 由来の確定値 (Std):

| ファイル | logic LOC |
|---|---|
| schema.ts | 180 |
| enums.ts | 40 |
| client.ts | 40 |
| owner.ts (withOwner, SEC-001) | 120 |
| migrate.ts | 30 |
| index.ts | 20 |
| types/db.ts | 30 |
| drizzle.config.ts | 20 |
| **logic 小計** | **~480** |
| 単体テスト (所有者分離 100% カバー含む) | ~250 |
| **合計** | **~730 (9-10 ファイル)** |

→ 1 cross-cutting 基盤あたり rough 想定 (8/560) を上回る。残り基盤 (ui/auth/notification/billing/legal/service-info) を同比率で微調整。billing のみ投げ銭簡素化で逆に減。

## 3. ターゲット別 refined 内訳 (Std、NFR 適用後)

| 区分 | ターゲット | Std files | Std lines | 状態 |
|---|---|---|---|---|
| 横断 | _shared/db | 10 | 730 | **設計済(具体)** |
| 横断 | _shared/ui | 13 | 780 | rough |
| 横断 | _shared/auth | 8 | 540 | rough |
| 横断 | _shared/notification | 9 | 660 | rough |
| 横断 | _shared/billing(投げ銭) | 5 | 320 | rough(簡素化) |
| 横断 | _shared/service-info | 3 | 230 | rough |
| 横断 | _shared/legal | 5 | 280 | rough |
| 機能 | inventory | 14 | 1,100 | rough |
| 機能 | inspection | 12 | 880 | rough |
| 機能 | shopping-list(無料) | 9 | 680 | rough |
| 機能 | feedback | 7 | 430 | rough |
| 基本 | 12項目(PJ初期化/CI/監視/PWA等) | 33 | 1,480 | rough |
| **合計** | | **~128** | **~8,110 pre / ~5,400 NFR後** | |

> billing は投げ銭化で initial の 8/560 → 5/320 に減 (Checkout + donation 記録 + webhook 署名検証のみ、アンロック判定なし)。

## 4. NFR 倍率 (initial と同じ)
scale=low(0.7) × throughput=low(0.8) × latency=standard(1.0) × availability=none(0.9) = **0.5x**。pre-NFR ~8,100 行 → NFR 後 ~5,400 行。

## 5. 人間ボトルネック (±50%、initial と同じ ~16h)
スマホ実機確認 4h / 投げ銭 Stripe 実決済スモーク 2h(test→100円 live 1回) / 視覚デザインレビュー 2h / 法務コピー(プライバシー/利用規約 + 投げ銭の任意性明示)3h / デプロイ確認 3h / API キー取得設定 2h。

## 6. AI 推論トークン (フェルミ、±50%)
- 設計: concept 13K + 投げ銭update + secure 26K + feature×11(~10K) + spec-review×11(~6K) + design 15K + estimate×2 + audit ~46K ≈ **300K**
- 実装: 11 対象 × ~80-90K (tdd 実測経験則) + E2E ≈ **~1.0M**
- Min ~600K / Full ~2.45M

## 7. 次のステップ
- 実装 (tdd) が進み STATS.md に実 LOC/tokens/active_min が蓄積されたら、`/flow:status` で精度確認。乖離が顕著なら calibrated に再校正。
- 以降の Phase 2/3 完了ごとの再 estimate は不要 (SCENARIO §3、2 タイミング標準を満たした)。
