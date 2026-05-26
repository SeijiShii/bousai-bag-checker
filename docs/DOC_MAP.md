# プロダクトドキュメントマップ (持ち出し袋チェッカー)

**最終更新**: 2026-05-26 19:55 (+09:00)
**最新コマンド**: /flow:concept (D20260526_001_concept_initial)
**統計**: 機能フォルダ 4 / 横断フォルダ 7 / 改修 0 / バグ修正 0 / クレーム 0 / Open 論点 3

> AI 用エントリポイント。目的別に「どこから読めばいいか」を示す。

<!-- auto-generated-start -->

## 0. AI 用クイックアクセス（目的別）

| 目的 | 最初に Read | 次に Read | 注記 |
|---|---|---|---|
| プロダクト全体を理解する | `./concept.md` (§1, §1.3, §4.2) | `./INDEX.md` | 5 分で全体像 |
| 次に何をすべきか判断する | `./SCENARIO.md` (§5 カーソル) | `./AI_LOG/INDEX.md` | /flow:auto で三点照合 |
| 特定機能を理解する | `./<feature>/README.md` | `./<feature>/INDEX.md` → SPEC | feature 一覧は §2 |
| 実装前準備を確認する | `./PREREQUISITES.md` | `./concept.md §4.3` | API キー / アカウント |
| 設計判断の経緯を辿る | `./AI_LOG/INDEX.md` | 該当セッション | decision_id 索引で grep |
| 未決論点を見る | `./concept.md §8` | — | 3 件(期限なし品目/feedback-hub/service-info) |
| 工数感を知る | `./estimates/` | — | `/flow:estimate` で生成 |
| 法務対応状況を見る | `./concept.md §9` | `./_shared/legal/` | 公開+有償 PJ |

## 1. プロダクト全体
- **概念設計 (SoT)**: [./concept.md](./concept.md)
  - 一行で言うと: 防災備蓄の鮮度管理(期限/電池の点検リマインド)
  - 現フェーズ: 企画(concept 初版)
  - 最終更新: 2026-05-26
- **プロジェクト INDEX**: [./INDEX.md](./INDEX.md)
- **実装前準備**: [./PREREQUISITES.md](./PREREQUISITES.md)
- **見積もり**: [./estimates/](./estimates/)

## 2. 機能フォルダ（業務ドメイン）
| 優先度 | 基盤 | フォルダ | 状態 | INDEX |
|---|---|---|---|---|
| 3 | ✅ | inventory | 未設計 | [INDEX](./inventory/INDEX.md) |
| 3 | ❌ | feedback | 未設計 | [INDEX](./feedback/INDEX.md) |
| 4 | ❌ | inspection | 未設計 | [INDEX](./inspection/INDEX.md) |
| 4 | ❌ | shopping-list | 未設計 | [INDEX](./shopping-list/INDEX.md) |

## 3. 横断フォルダ（_shared/*）
| 優先度 | フォルダ | 状態 | INDEX |
|---|---|---|---|
| 1 | _shared/db | 未設計 | [INDEX](./_shared/db/INDEX.md) |
| 1 | _shared/ui | 未設計 | [INDEX](./_shared/ui/INDEX.md) |
| 2 | _shared/auth | 未設計 | [INDEX](./_shared/auth/INDEX.md) |
| 2 | _shared/notification | 未設計 | [INDEX](./_shared/notification/INDEX.md) |
| 2 | _shared/legal | 未設計 | [INDEX](./_shared/legal/INDEX.md) |
| 2 | _shared/service-info | 未設計 | [INDEX](./_shared/service-info/INDEX.md) |
| 3 | _shared/billing | 未設計 | [INDEX](./_shared/billing/INDEX.md) |

## 4. 設計判断の経緯
- **AI_LOG インデックス**: [./AI_LOG/INDEX.md](./AI_LOG/INDEX.md)
- **最新セッション**: D20260526_001_concept_initial (完了, D20260526-001〜014)
- **Open 論点**: 3 件 (concept §8 と同期)

## 5. 観点・選好データ（PJ 外部参照）
- **観点 SoT**: `~/.claude/flow-data/perspectives.md` (O22 ゲスト認証 / O40 feedback / O48 service-info 適用)
- **開発者選好**: `~/.claude/flow-data/preferences.md` (Neon スタック採用)
- **ideate 憲章**: `~/.claude/flow-data/ideate_charter.md` (PWYW / social_good 5 / 不安煽り回避)

## 6. ファイル種別ガイド（番号体系）
| 種別 | 番号 / パターン | 生成元 |
|---|---|---|
| 機能 SPEC | `001_*_SPEC.md` | `/flow:feature` |
| 機能 PLAN | `002_*_PLAN.md` | `/flow:feature` |
| 単体テスト計画 | `003_*_UNIT_TEST.md` | `/flow:feature` |
| E2E テスト計画 | `004_*_E2E_TEST.md` | `/flow:feature` |
| 実装レポート | `101_*_IMPL_REPORT.md` | `/flow:tdd` |
| AI_LOG セッション | `D<date>_<sess>_<cmd>_<target>.md` | 各 flow コマンド |

## 7. 依存・優先度グラフ（concept §1.3.4 から導出）
```
_shared/db (P1, 基盤✅)
_shared/ui (P1, 基盤✅)
_shared/auth (P2, 基盤✅) ← db
_shared/notification (P2, 基盤✅) ← db
_shared/legal (P2)
_shared/service-info (P2) ← db
_shared/billing (P3) ← db, auth
inventory (P3, 基盤✅) ← db, auth, ui
feedback (P3) ← db, auth
inspection (P4) ← inventory, notification
shopping-list (P4) ← inventory
```
循環依存: なし。

## 8. コマンド使い分けガイド
| やりたいこと | コマンド | 入力 |
|---|---|---|
| 新規機能を設計 | `/flow:feature <feature>` | concept.md + 機能 README |
| 実装前設計レビュー | `/flow:spec-review` | 設計 4 文書 |
| TDD 実装 | `/flow:tdd` | 設計文書 |
| デザインシステム | `/flow:design` | concept.md |
| 工数見積もり | `/flow:estimate` | concept or feature |
| 設計セキュリティ | `/flow:secure` | concept / feature |
| 自動進行 | `/flow:auto` | SCENARIO.md |

## 9. 履歴サマリ
- **改修件数 (累計)**: 0 件
- **バグ修正件数 (累計)**: 0 件
- **クレーム判定件数 (累計)**: 0 件

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
