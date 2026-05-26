# AI_LOG インデックス — 持ち出し袋チェッカー

**最終更新**: 2026-05-26 20:32 (+09:00)
**総セッション数**: 6 (concept / auto進行中 / secure / estimate / design / feature:db)
**総 decision 数**: 31

> このフォルダは AI 主導の自走 / 後追いトレースを目的とする詳細ログ。
> セッションごとに 1 ファイル、append-only、過去ファイルは削除・編集禁止。
> 人間向けサマリは `../concept.md` §7 決定事項ログ を参照。

<!-- auto-generated-start -->

## セッション一覧（新しい順）

| ファイル | 実行日 | コマンド | 対象 | decision 範囲 | 状態 |
|---|---|---|---|---|---|
| [D20260526_006_feature__shared_db.md](./D20260526_006_feature__shared_db.md) | 2026-05-26 | /flow:feature | _shared/db | D20260526-029〜031 | 完了 |
| [D20260526_005_design_system.md](./D20260526_005_design_system.md) | 2026-05-26 | /flow:design | system (NEW) | D20260526-026〜027 | 完了 |
| [D20260526_004_estimate_whole.md](./D20260526_004_estimate_whole.md) | 2026-05-26 | /flow:estimate | whole (rough) | D20260526-025 | 完了 |
| [D20260526_003_secure_concept.md](./D20260526_003_secure_concept.md) | 2026-05-26 | /flow:secure | concept (design) | D20260526-017〜023 | 完了 |
| [D20260526_002_resume_continuous.md](./D20260526_002_resume_continuous.md) | 2026-05-26 | /flow:auto | next-step ルーティング | (反復ログ) | 進行中 |
| [D20260526_001_concept_initial.md](./D20260526_001_concept_initial.md) | 2026-05-26 | /flow:concept | initial | D20260526-001〜014 | 完了 |

## decision_id 索引（grep 用、新しい順）

| ID | command | phase | chosen (短縮) | type | ファイル |
|---|---|---|---|---|---|
| D20260526-031 | /flow:feature | db SEC-001 | withOwner 所有者強制(IDOR防止、100%カバー) | auto-recommended | D20260526_006_feature__shared_db.md |
| D20260526-030 | /flow:feature | db schema | 7テーブル確定(donations/plan廃止反映) | auto-recommended | D20260526_006_feature__shared_db.md |
| D20260526-029 | /flow:feature | db タグ | cross-cutting, auth-required | auto-recommended | D20260526_006_feature__shared_db.md |
| D20260526-028 | /flow:auto | 課金モデル再変更(user) | 100円投げ銭=任意支援(全機能無料、アンロックなし) | explicit-choice | D20260526_002_resume_continuous.md |
| D20260526-027 | /flow:design | SoT 生成 | design-system.md 全節生成 | auto-recommended | D20260526_005_design_system.md |
| D20260526-026 | /flow:design | 主色方向(user) | ティールグリーン #2E8B74(緑寄り) | explicit-choice | D20260526_005_design_system.md |
| D20260526-025 | /flow:estimate | whole rough | Min/Std/Full=50/115/230 files, NFR 0.5x | auto-recommended | D20260526_004_estimate_whole.md |
| D20260526-024 | /flow:auto | 課金モデル(user 指示) | 100円単発買い切り=買い物TODOリスト(PWYW廃止) | explicit-choice | D20260526_002_resume_continuous.md |
| D20260526-023 | /flow:secure | O28 依存 | --phase=design 対象外で skip | auto-recommended | D20260526_003_secure_concept.md |
| D20260526-022 | /flow:secure | SEC-005 O25 | 秘密情報=対応済み(注記のみ) | auto-recommended | D20260526_003_secure_concept.md |
| D20260526-021 | /flow:secure | SEC-004 O27 | レート制限 Medium→§8 open | auto-recommended | D20260526_003_secure_concept.md |
| D20260526-020 | /flow:secure | SEC-003 O24 | 入力検証 Medium→§8 open | auto-recommended | D20260526_003_secure_concept.md |
| D20260526-019 | /flow:secure | SEC-002 O26 | PII ログ High→accepted-as-req(§3.1) | auto-recommended | D20260526_003_secure_concept.md |
| D20260526-018 | /flow:secure | SEC-001 O23 | 認可漏れ High→accepted-as-req(§3.1) | auto-recommended | D20260526_003_secure_concept.md |
| D20260526-017 | /flow:secure | PJ 性質判定 | 公開MT/有償/PIIあり/AIなし/国内 | auto-recommended | D20260526_003_secure_concept.md |
| D20260526-016 | /flow:concept | Step 7.7 Git 実施 | git init + commit aff3cc9 | explicit-choice | D20260526_001_concept_initial.md |
| D20260526-015 | /flow:concept | Step 7.5 preferences 実施 | 全更新(Neon等 +1, Resend新規) | explicit-choice | D20260526_001_concept_initial.md |
| D20260526-014 | /flow:concept | Step 7.7 Git | git init+commit(→D-016 で解決) | open→解決 | D20260526_001_concept_initial.md |
| D20260526-013 | /flow:concept | Step 7.5 preferences | 全更新(→D-015 で解決) | open→解決 | D20260526_001_concept_initial.md |
| D20260526-012 | /flow:concept | Step 5.47 シナリオ | 新規 MVP 立ち上げ | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-011 | /flow:concept | Step 3 §1.3 構造 | 機能4 + 横断7 | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-010 | /flow:concept | Q12.13 feedback | 👍/👎+バグ報告、hub将来 | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-009 | /flow:concept | Q12.12 デザイン | 穏やか/信頼感/淡々 | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-008 | /flow:concept | Q12.11 周知 | note+X+SEO | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-007 | /flow:concept | Q12.10 公開 | サブドメ+Vercel完結 | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-006 | /flow:concept | Q12.9 Git | GitHub private/trunk | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-005 | /flow:concept | Q12.7 共通機能 | 通知メール+アプリ内、監査v1不要 | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-004 | /flow:concept | Q12.6 計測 | Sentry+自前ログ(GA4なし) | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-003 | /flow:concept | MVP スコープ | 単一ユーザー、家族共有v2 | explicit-choice | D20260526_001_concept_initial.md |
| D20260526-002 | /flow:concept | Q1-Q10 wants | wants 由来確認採用 | auto-recommended | D20260526_001_concept_initial.md |
| D20260526-001 | /flow:concept | Step 1.7 preferences | Neon スタック傾向 | auto-recommended | D20260526_001_concept_initial.md |

## Open 論点（chosen_type=open、全期間横断）

| ID | 論点タイトル | 採番セッション | 関連 decision |
|---|---|---|---|
| [論点-001] | 期限のない品目の鮮度の扱い | D20260526_001 | concept §8 |
| [論点-002] | feedback-hub 未構築 | D20260526_001 | concept §8 |
| [論点-003] | service-info スキーマ | D20260526_001 | concept §8 |
| [論点-006] | [SEC-003] 入力検証 (Zod/CSV/XSS) | D20260526_003 | concept §8、feature 設計時解消 |
| [論点-007] | [SEC-004] レート制限/公開EP | D20260526_003 | concept §8、feature 設計時解消 |

> [論点-004] [SEC-001] 認可漏れ / [論点-005] [SEC-002] PII ログ は `accepted-as-requirement` (§3.1 NFR 化済、open ではない)。

## Superseded chain（旧 Open → 新解決）

| 旧 ID | 新 ID | 解決日 | 解決セッション |
|---|---|---|---|
| D20260526-013 (preferences 更新) | D20260526-015 | 2026-05-26 | D20260526_001 |
| D20260526-014 (Git init) | D20260526-016 | 2026-05-26 | D20260526_001 |
| D20260526-003 (課金=PWYW) | D20260526-024 | 2026-05-26 | D20260526_002 |
| D20260526-024 (100円買い切り) | D20260526-028 | 2026-05-26 | D20260526_002 |

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
