# AI_LOG インデックス — 持ち出し袋チェッカー

**最終更新**: 2026-05-26 19:55 (+09:00)
**総セッション数**: 1
**総 decision 数**: 14

> このフォルダは AI 主導の自走 / 後追いトレースを目的とする詳細ログ。
> セッションごとに 1 ファイル、append-only、過去ファイルは削除・編集禁止。
> 人間向けサマリは `../concept.md` §7 決定事項ログ を参照。

<!-- auto-generated-start -->

## セッション一覧（新しい順）

| ファイル | 実行日 | コマンド | 対象 | decision 範囲 | 状態 |
|---|---|---|---|---|---|
| [D20260526_001_concept_initial.md](./D20260526_001_concept_initial.md) | 2026-05-26 | /flow:concept | initial | D20260526-001〜014 | 完了 |

## decision_id 索引（grep 用、新しい順）

| ID | command | phase | chosen (短縮) | type | ファイル |
|---|---|---|---|---|---|
| D20260526-014 | /flow:concept | Step 7.7 Git | git init 確認待ち | open | D20260526_001_concept_initial.md |
| D20260526-013 | /flow:concept | Step 7.5 preferences | 更新確認待ち | open | D20260526_001_concept_initial.md |
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
| D20260526-013 | preferences 更新確認 | D20260526_001 | D20260526-001 |
| D20260526-014 | Git init 確認 | D20260526_001 | D20260526-006 |
| [論点-001] | 期限のない品目の鮮度の扱い | D20260526_001 | concept §8 |
| [論点-002] | feedback-hub 未構築 | D20260526_001 | concept §8 |
| [論点-003] | service-info スキーマ | D20260526_001 | concept §8 |

## Superseded chain（旧 Open → 新解決）

| 旧 ID | 新 ID | 解決日 | 解決セッション |
|---|---|---|---|
| (なし) |

<!-- auto-generated-end -->

<!-- user-edit-start -->
<!-- user-edit-end -->
