# AI_LOG インデックス — 持ち出し袋チェッカー

**最終更新**: 2026-05-27 15:49 (+09:00)
**総セッション数**: 36 (... + audit(full), resume)
**総 decision 数**: 92
**進捗**: **autonomous 全完了** (unit 136 + E2E 11 green、bootstrap/Design/E2E すべて green)。**リリース前 full 監査 (D-036) 実施** → High 1 件: **O48 service-info エンドポイント未配線** (`api/service-info.ts` 不在) を検出、auto §3.0c で `/flow:revise _shared/service-info` シューティング中。**P4.7 Release は Class C/B 境界でユーザー主導待ち** (実キー FILL + Clerk/Stripe/Resend 配線 + Vercel デプロイ)。※ /flow:wording(P4.45)は仕上げで推奨
**横断 TODO (spec-review 由来)**: 公開EPレート制限/bot を `src/services/ratelimit/` 共通化(feedback/tip/service-info)

> このフォルダは AI 主導の自走 / 後追いトレースを目的とする詳細ログ。
> セッションごとに 1 ファイル、append-only、過去ファイルは削除・編集禁止。
> 人間向けサマリは `../concept.md` §7 決定事項ログ を参照。

<!-- auto-generated-start -->

## セッション一覧（新しい順）

| ファイル | 実行日 | コマンド | 対象 | decision 範囲 | 状態 |
|---|---|---|---|---|---|
| [D20260527_036_audit_full.md](./D20260527_036_audit_full.md) | 2026-05-27 | /flow:audit | full (リリース前) | D20260527-090〜092 | 完了 |
| [D20260527_035_resume_continuous.md](./D20260527_035_resume_continuous.md) | 2026-05-27 | /flow:auto | next-step ルーティング (audit→revise) | D20260527-089 | 進行中 |
| [D20260527_034_release_root.md](./D20260527_034_release_root.md) | 2026-05-27 | /flow:release | root | D20260527-088 | 進行中(ユーザー待ち) |
| [D20260527_033_e2e_features.md](./D20260527_033_e2e_features.md) | 2026-05-27 | /flow:e2e | inventory/shopping/inspection/feedback | D20260527-085〜087 | 完了 |
| [D20260527_032_design_review.md](./D20260527_032_design_review.md) | 2026-05-27 | /flow:design --review-only | 全画面 | D20260527-083〜084 | 完了 |
| [D20260527_031_tdd_app-shell.md](./D20260527_031_tdd_app-shell.md) | 2026-05-27 | /flow:auto (bootstrap) | app-shell | D20260527-079〜082 | 完了 |
| [D20260527_030_tdd_shopping-list.md](./D20260527_030_tdd_shopping-list.md) | 2026-05-27 | /flow:tdd | shopping-list | D20260527-078 | 完了 |
| [D20260527_029_tdd_inspection.md](./D20260527_029_tdd_inspection.md) | 2026-05-27 | /flow:tdd | inspection | D20260527-077 | 完了 |
| [D20260527_028_tdd_feedback.md](./D20260527_028_tdd_feedback.md) | 2026-05-27 | /flow:tdd | feedback | D20260527-076 | 完了 |
| [D20260527_027_tdd_inventory.md](./D20260527_027_tdd_inventory.md) | 2026-05-27 | /flow:tdd | inventory | D20260527-074〜075 | 完了 |
| [D20260527_026_tdd__shared_billing.md](./D20260527_026_tdd__shared_billing.md) | 2026-05-27 | /flow:tdd | _shared/billing | D20260527-073 | 完了 |
| [D20260527_025_tdd__shared_service-info.md](./D20260527_025_tdd__shared_service-info.md) | 2026-05-27 | /flow:tdd | _shared/service-info | D20260527-071〜072 | 完了 |
| [D20260527_024_tdd__shared_legal.md](./D20260527_024_tdd__shared_legal.md) | 2026-05-27 | /flow:tdd | _shared/legal | D20260527-070 | 完了 |
| [D20260527_023_tdd__shared_notification.md](./D20260527_023_tdd__shared_notification.md) | 2026-05-27 | /flow:tdd | _shared/notification | D20260527-068〜069 | 完了 |
| [D20260527_022_tdd__shared_auth.md](./D20260527_022_tdd__shared_auth.md) | 2026-05-27 | /flow:tdd | _shared/auth | D20260527-066〜067 | 完了 |
| [D20260527_021_tdd__shared_ui.md](./D20260527_021_tdd__shared_ui.md) | 2026-05-27 | /flow:tdd | _shared/ui | D20260527-064〜065 | 完了 |
| [D20260527_020_tdd__shared_db.md](./D20260527_020_tdd__shared_db.md) | 2026-05-27 | /flow:tdd | _shared/db | D20260527-061〜063 | 完了 |
| [D20260527_019_spec-review_feedback-inspection-shopping.md](./D20260527_019_spec-review_feedback-inspection-shopping.md) | 2026-05-27 | /flow:spec-review | feedback/inspection/shopping-list | D20260527-058〜060 | 完了 |
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
| [D20260526_002_resume_continuous.md](./D20260526_002_resume_continuous.md) | 2026-05-26〜27 | /flow:auto | next-step ルーティング (16+ dispatch) | D20260527-043/D20260526-024/028 等 | 進行中(誤停止から復帰、P4 tdd 継続) |
| [D20260526_001_concept_initial.md](./D20260526_001_concept_initial.md) | 2026-05-26 | /flow:concept | initial | D20260526-001〜014 | 完了 |

## decision_id 索引（grep 用、新しい順）

| ID | command | phase | chosen (短縮) | type | ファイル |
|---|---|---|---|---|---|
| D20260527-092 | /flow:audit | drift シューティング | High(#4 O48)を /flow:revise dispatch(auto-execute)、論点status/カーソルはbookkeeping | auto-recommended | D20260527_036_audit_full.md |
| D20260527-091 | /flow:audit | O48 判定 | service-info core+7unit緑だが api/service-info.ts 不在=実行時pull不可、High(no-key修正) | auto-recommended | D20260527_036_audit_full.md |
| D20260527-090 | /flow:audit | full scope 範囲 | #1-#4実行+#6/#8/#9補足、#5/#7枠組みのみskip | auto-recommended | D20260527_036_audit_full.md |
| D20260527-089 | /flow:auto | 再開 next-step | §3.0c鮮度ゲート(audit初回stale)発火→/flow:audit full を auto-invoke | auto-recommended | D20260527_035_resume_continuous.md |
| D20260527-088 | /flow:release | P4.7 到達 | no-key 枯渇→release dispatch。実キー(C)+SDK配線+デプロイ(B)はユーザー主導待ちで一時停止 | explicit-choice | D20260527_034_release_root.md |
| D20260527-087 | /flow:e2e | E2E 結果/完了判定 | 11 spec 全 green(flaky なし)、IDOR/cron/PII/CSV は unit、103×4 生成 | auto-recommended | D20260527_033_e2e_features.md |
| D20260527-086 | /flow:e2e | FeedbackWidget 未マウント | 設定画面にマウント+unit回帰、feedback E2E 到達性確保 | auto-recommended | D20260527_033_e2e_features.md |
| D20260527-085 | /flow:e2e | E2E FW/環境 | @playwright/test + system chrome(channel)、keyless dev(memory seed) headless | auto-recommended | D20260527_033_e2e_features.md |
| D20260527-084 | /flow:design | 視覚レビュー逸脱対応 | [High]品目追加導線欠落をTDD修正(常設追加ボタン)、視覚/O38/O41/O43 PASS | auto-recommended | D20260527_032_design_review.md |
| D20260527-083 | /flow:design | 視覚レビュー手法 | system chrome+Playwright(channel:chrome、DL無)でkeyless dev をスクショ | auto-recommended | D20260527_032_design_review.md |
| D20260527-082 | /flow:auto | app-shell Phase E | dev launcher(keyless smoke)+CI+.env.example、O36/O37 完了 | auto-recommended | D20260527_031_tdd_app-shell.md |
| D20260527-081 | /flow:auto | app-shell Phase D | api core(SEC-001/PGlite)+Vercel adapters+httpBackend、実SDKはrelease注入 | auto-recommended | D20260527_031_tdd_app-shell.md |
| D20260527-080 | /flow:auto | app-shell データ層 | injectable Backend port(memory keyless/http本番)、最小pathルーティング | auto-recommended | D20260527_031_tdd_app-shell.md |
| D20260527-079 | /flow:auto | 全11後の次アクション | app shell bootstrap を no-key Class A 前提作業として実施(§4.5.1#0)、停止しない | auto-recommended | D20260527_031_tdd_app-shell.md |
| D20260527-078 | /flow:tdd | shopping-list 実装 | CSV安全(R3)+重複防止(R2)+購入管理+無料UI(D-028)、11テスト green、全11実装完了 | auto-recommended | D20260527_030_tdd_shopping-list.md |
| D20260527-077 | /flow:tdd | inspection 実装 | 期限抽出+cron冪等(R2)+季節点検、freshness共有(R1)、テスト green | auto-recommended | D20260527_029_tdd_inspection.md |
| D20260527-076 | /flow:tdd | feedback 実装 | 👍/👎+バグ報告+PII scrub(SEC-002)+レート制限(SEC-004)、8テスト green | auto-recommended | D20260527_028_tdd_feedback.md |
| D20260527-069 | /flow:tdd | notif サービス | 購読/quiet/配信履歴/in-app、db拡張、12テスト green | auto-recommended | D20260527_023_tdd__shared_notification.md |
| D20260527-068 | /flow:tdd | notif PII(SEC-002) | scrubPII/sentryBeforeSend 最優先、PII 5テスト | auto-recommended | D20260527_023_tdd__shared_notification.md |
| D20260527-067 | /flow:tdd | auth SEC-001/O22 | getAuthUserId信用線+冪等、7テスト green | auto-recommended | D20260527_022_tdd__shared_auth.md |
| D20260527-066 | /flow:tdd | auth injectable | SessionResolver mock、実Clerkはrelease(O35) | auto-recommended | D20260527_022_tdd__shared_auth.md |
| D20260527-065 | /flow:tdd | ui コンポーネント | Button/StatusChip/Field/InfoButton等 13テスト green | auto-recommended | D20260527_021_tdd__shared_ui.md |
| D20260527-064 | /flow:tdd | ui scaffold/トークン | React/Vite/Tailwind + tokens.ts 単一ソース | auto-recommended | D20260527_021_tdd__shared_ui.md |
| D20260527-063 | /flow:tdd | db テスト | 9/9 green、SEC-001 所有者分離100% | auto-recommended | D20260527_020_tdd__shared_db.md |
| D20260527-062 | /flow:tdd | db enum 生成 | drizzle.config schema 配列化で CREATE TYPE 生成 | auto-recommended | D20260527_020_tdd__shared_db.md |
| D20260527-061 | /flow:tdd | db scaffold | greenfield scaffold を db 前段で作成(Class A) | auto-recommended | D20260527_020_tdd__shared_db.md |
| D20260527-060 | /flow:spec-review | shopping 905 | freshness import+generate重複防止マージ | auto-recommended | D20260527_019_spec-review_feedback-inspection-shopping.md |
| D20260527-059 | /flow:spec-review | inspection 905 | freshness import+cron冪等+通知PII最小化 | auto-recommended | D20260527_019_spec-review_feedback-inspection-shopping.md |
| D20260527-058 | /flow:spec-review | feedback 905 | レート制限/bot共通化(P2)+scrubPII import | auto-recommended | D20260527_019_spec-review_feedback-inspection-shopping.md |
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
