# AI_LOG インデックス — 持ち出し袋チェッカー

**最終更新**: 2026-05-27 (+09:00)
**総セッション数**: 18 (..._feature:..×11 + spec-review:inventory)
**総 decision 数**: 57
**進捗**: 全11設計完了 + spec-review 1/4 (inventory)。残 spec-review: feedback/inspection/shopping-list → P4 tdd 実装

> このフォルダは AI 主導の自走 / 後追いトレースを目的とする詳細ログ。
> セッションごとに 1 ファイル、append-only、過去ファイルは削除・編集禁止。
> 人間向けサマリは `../concept.md` §7 決定事項ログ を参照。

<!-- auto-generated-start -->

## セッション一覧（新しい順）

| ファイル | 実行日 | コマンド | 対象 | decision 範囲 | 状態 |
|---|---|---|---|---|---|
| [D20260527_018_spec-review_inventory.md](./D20260527_018_spec-review_inventory.md) | 2026-05-27 | /flow:spec-review | inventory | D20260527-056〜057 | 完了 |
| [D20260527_017_feature_shopping-list.md](./D20260527_017_feature_shopping-list.md) | 2026-05-27 | /flow:feature | shopping-list | D20260527-054〜055 | 完了 |
| [D20260527_016_feature_inspection.md](./D20260527_016_feature_inspection.md) | 2026-05-27 | /flow:feature | inspection | D20260527-052〜053 | 完了 |
| [D20260527_015_feature_feedback.md](./D20260527_015_feature_feedback.md) | 2026-05-27 | /flow:feature | feedback | D20260527-050〜051 | 完了 |
| [D20260527_014_feature_inventory.md](./D20260527_014_feature_inventory.md) | 2026-05-27 | /flow:feature | inventory | D20260527-048〜049 | 完了 |
| [D20260527_013_feature__shared_billing.md](./D20260527_013_feature__shared_billing.md) | 2026-05-27 | /flow:feature | _shared/billing | D20260527-046〜047 | 完了 |
| [D20260527_012_feature__shared_service-info.md](./D20260527_012_feature__shared_service-info.md) | 2026-05-27 | /flow:feature | _shared/service-info | D20260527-044〜045 | 完了 |
| [D20260526_011_feature__shared_legal.md](./D20260526_011_feature__shared_legal.md) | 2026-05-26 | /flow:feature | _shared/legal | D20260526-041〜042 | 完了 |
| [D20260526_010_feature__shared_notification.md](./D20260526_010_feature__shared_notification.md) | 2026-05-26 | /flow:feature | _shared/notification | D20260526-038〜040 | 完了 |
| [D20260526_009_feature__shared_auth.md](./D20260526_009_feature__shared_auth.md) | 2026-05-26 | /flow:feature | _shared/auth | D20260526-035〜037 | 完了 |
| [D20260526_008_feature__shared_ui.md](./D20260526_008_feature__shared_ui.md) | 2026-05-26 | /flow:feature | _shared/ui | D20260526-033〜034 | 完了 |
| [D20260526_007_estimate_refined.md](./D20260526_007_estimate_refined.md) | 2026-05-26 | /flow:estimate | whole (refined) | D20260526-032 | 完了 |
| [D20260526_006_feature__shared_db.md](./D20260526_006_feature__shared_db.md) | 2026-05-26 | /flow:feature | _shared/db | D20260526-029〜031 | 完了 |
| [D20260526_005_design_system.md](./D20260526_005_design_system.md) | 2026-05-26 | /flow:design | system (NEW) | D20260526-026〜027 | 完了 |
| [D20260526_004_estimate_whole.md](./D20260526_004_estimate_whole.md) | 2026-05-26 | /flow:estimate | whole (rough) | D20260526-025 | 完了 |
| [D20260526_003_secure_concept.md](./D20260526_003_secure_concept.md) | 2026-05-26 | /flow:secure | concept (design) | D20260526-017〜023 | 完了 |
| [D20260526_002_resume_continuous.md](./D20260526_002_resume_continuous.md) | 2026-05-26 | /flow:auto | next-step ルーティング | (反復ログ) | 進行中 |
| [D20260526_001_concept_initial.md](./D20260526_001_concept_initial.md) | 2026-05-26 | /flow:concept | initial | D20260526-001〜014 | 完了 |

## decision_id 索引（grep 用、新しい順）

| ID | command | phase | chosen (短縮) | type | ファイル |
|---|---|---|---|---|---|
| D20260527-057 | /flow:spec-review | inventory 905 | 905生成+002反映、Critical/Highなし | auto-recommended | D20260527_018_spec-review_inventory.md |
| D20260527-056 | /flow:spec-review | inventory 判断4件 | freshness共有/itemSchema単一/写真proxy/lead_days連動 | auto-recommended | D20260527_018_spec-review_inventory.md |
| D20260527-055 | /flow:feature | shopping CSV/SEC | CSV インジェクションエスケープ+withOwner | auto-recommended | D20260527_017_feature_shopping-list.md |
| D20260527-054 | /flow:feature | shopping タグ | feature/auth、TODO 生成+購入管理、無料(D-028) | auto-recommended | D20260527_017_feature_shopping-list.md |
| D20260527-053 | /flow:feature | inspection cron | Cron シークレット保護+通知トリガー | auto-recommended | D20260527_016_feature_inspection.md |
| D20260527-052 | /flow:feature | inspection タグ | feature/auth/stateful、期限抽出+季節点検 | auto-recommended | D20260527_016_feature_inspection.md |
| D20260527-051 | /flow:feature | feedback SEC | レート制限/bot+PII scrub(SEC-004/002) | auto-recommended | D20260527_015_feature_feedback.md |
| D20260527-050 | /flow:feature | feedback 論点002 | 案A 自前DB+運用通知(hub後、D-043承認) | auto-recommended | D20260527_015_feature_feedback.md |
| D20260527-049 | /flow:feature | inventory SEC/E2E | withOwner(IDOR防止)+E2E L1/L2採用 | auto-recommended | D20260527_014_feature_inventory.md |
| D20260527-048 | /flow:feature | inventory 論点001 | 案A 3種freshness(D-043承認) | auto-recommended | D20260527_014_feature_inventory.md |
| D20260527-047 | /flow:feature | billing 安全性 | 金額サーバー強制+署名検証+冪等+アンロックなし | auto-recommended | D20260527_013_feature__shared_billing.md |
| D20260527-046 | /flow:feature | billing タグ/フロー | 投げ銭 Checkout+webhook→donation(D-028) | auto-recommended | D20260527_013_feature__shared_billing.md |
| D20260527-045 | /flow:feature | svc-info 認可 | 共有トークン+レート制限+PII非混入(SEC-004部分) | auto-recommended | D20260527_012_feature__shared_service-info.md |
| D20260527-044 | /flow:feature | svc-info 論点003 | MVP最小スキーマ先行(契約SoT=service-hub) | auto-recommended | D20260527_012_feature__shared_service-info.md |
| D20260527-043 | /flow:auto | seiji論点の進め方(user) | concept推奨でauto-pick進行(003/001/002) | explicit-choice | D20260526_002_resume_continuous.md |
| D20260526-042 | /flow:feature | legal 構成 | privacy/terms/特商法(投げ銭)+免責、文言は公開前human | auto-recommended | D20260526_011_feature__shared_legal.md |
| D20260526-041 | /flow:feature | legal タグ | cross-cutting (静的法務ページ) | auto-recommended | D20260526_011_feature__shared_legal.md |
| D20260526-040 | /flow:feature | notif schema | notifications/email_deliveries 追加(配信履歴/コスト) | auto-recommended | D20260526_010_feature__shared_notification.md |
| D20260526-039 | /flow:feature | notif SEC-002 | PII マスク実装担当=notification(論点-005進展) | auto-recommended | D20260526_010_feature__shared_notification.md |
| D20260526-038 | /flow:feature | notif タグ | cross-cutting, auth-required | auto-recommended | D20260526_010_feature__shared_notification.md |
| D20260526-037 | /flow:feature | auth O22 | Clerk 同一userId継続で引き継ぎ(cross-device v2) | auto-recommended | D20260526_009_feature__shared_auth.md |
| D20260526-036 | /flow:feature | auth SEC-001 | getAuthUserId 信用線→withOwner、req user_id無視 | auto-recommended | D20260526_009_feature__shared_auth.md |
| D20260526-035 | /flow:feature | auth タグ | cross-cutting, auth-required, stateful | auto-recommended | D20260526_009_feature__shared_auth.md |
| D20260526-034 | /flow:feature | ui IF | トークン+基本コンポーネント+lucide/SVG+O41 | auto-recommended | D20260526_008_feature__shared_ui.md |
| D20260526-033 | /flow:feature | ui タグ/SoT | cross-cutting, design-system 実装 | auto-recommended | D20260526_008_feature__shared_ui.md |
| D20260526-032 | /flow:estimate | whole refined | Std~128files/5.4K行、band±300→±100収束 | auto-recommended | D20260526_007_estimate_refined.md |
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
| [論点-001] | 期限のない品目の鮮度の扱い | D20260526_001 | **解決**: 案A(3種freshness)採用、inventory SPEC+db schema 反映 (D-043/048) |
| [論点-002] | feedback-hub 未構築 | D20260526_001 | **解決**: 案A(自前DB+運用通知、hub後)採用、feedback SPEC 反映 (D-043/050) |
| [論点-003] | service-info スキーマ | D20260526_001 | **dispatched-to-feature** (MVP最小先行、調整は論点-S-svc-1) |
| [論点-S-svc-1] | service-hub 契約スキーマ確定 | D20260527_012 | 契約確定時 (担当 seiji) |
| [論点-006] | [SEC-003] 入力検証 (Zod/CSV/XSS) | D20260526_003 | concept §8、feature 設計時解消 |
| [論点-007] | [SEC-004] レート制限/公開EP | D20260526_003 | concept §8、feature 設計時解消 |
| [論点-S-db-1] | freshness_type 最終形 | D20260526_006 | inventory 設計時 (担当 seiji) |
| [論点-S-auth-1] | クロスデバイス ゲストデータ統合 | D20260526_009 | v2 defer (担当 seiji) |
| [論点-S-legal-1] | 投げ銭の特商法該当性 最終確認 | D20260526_011 | 公開前 (担当 seiji) |

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
