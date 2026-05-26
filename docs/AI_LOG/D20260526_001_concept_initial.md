# AI_LOG セッション D20260526_001 — /flow:concept (initial)

**実行日時**: 2026-05-26 19:50 〜 19:55 (+09:00)
**コマンド**: /flow:concept
**対象**: プロジェクト全体（初版作成、/flow:ideate I20260526-008 から連鎖）
**実行者**: Claude (Opus 4.7) + seiji
**状態**: 完了
**含まれる decision**: D20260526-001 〜 D20260526-014
**ファイル**: `D20260526_001_concept_initial.md`

---

## 主要決定サマリ（人間向け要約）

| ID | テーマ | 採用 | type |
|---|---|---|---|
| D20260526-002 | Q1-Q10 wants 由来確認 | 名称/ユーザー/課題/UC/規模/NFR/技術=Neon | auto-recommended |
| D20260526-003 | MVP スコープ | 単一ユーザー、家族共有は v2 | explicit-choice(推奨採用) |
| D20260526-004 | アナリティクス | Sentry + 自前コストログのみ(GA4 不採用) | auto-recommended |
| D20260526-005 | 通知 | メール(Resend)+ アプリ内、Web Push 不採用 | auto-recommended |
| D20260526-006 | Git | GitHub private / trunk-based / Conventional | auto-recommended |
| D20260526-007 | 公開戦略 | 既存ドメインのサブドメ + Vercel 完結 | auto-recommended |
| D20260526-012 | シナリオ種別 | 新規 MVP 立ち上げ | auto-recommended |

## 依存関係
- D20260526-004〜010 → 依存: [D20260526-002, D20260526-003]（wants + MVP スコープ確定が前提）
- 外部依存: `~/ideas/registry.jsonl` I20260526-008 (起点 idea)、preferences.md (Neon スタック)、charter (PWYW/social_good)

## 生成・更新したアーティファクト
- 新規: `docs/concept.md` (§1〜§11)
- 新規: `docs/INDEX.md` / `docs/DOC_MAP.md` / `docs/PREREQUISITES.md` / `docs/SCENARIO.md`
- 新規: 機能フォルダ 4 (inventory/inspection/shopping-list/feedback) + 横断 7 (_shared/{db,ui,auth,notification,legal,service-info,billing}) の README + INDEX
- 新規: `docs/AI_LOG/D20260526_001_concept_initial.md`(本ファイル) + `INDEX.md`
- (予定) ルート README.md / Git init + commit

## 学習・改善
- このセッションでのコマンド改善要望なし(既存テンプレで充足)

---

## Decisions

```yaml
- id: D20260526-001
  timestamp: 2026-05-26T19:50:00+09:00
  command: /flow:concept
  phase: Step 1.7 preferences 読込
  question: preferences.md 読込
  options: []
  recommended: null
  chosen: "Neon スタック(React+TS/Vercel/Neon/Clerk/Drizzle/shadcn) を推奨バイアス源に。採用回数 2 の傾向あり"
  chosen_type: auto-recommended
  depends_on: []
  context: |
    preferences.md (学習元 2 PJ: hana-memo/service-hub) を読込。§2.1 React+TS / §2.5 Vercel /
    §2.6 Sentry / §2.14 shadcn が採用 2、§2.3 Neon / §2.4 Clerk / §2.13 Drizzle が採用 1(charter §0 デフォルト)。

- id: D20260526-002
  timestamp: 2026-05-26T19:51:00+09:00
  command: /flow:concept
  phase: Step 2 / Q1-Q10 (wants 由来確認)
  question: wants.md の Q1-Q10 該当内容を採用するか
  options: []
  recommended: "wants.md の記載をそのまま採用"
  chosen: "名称=持ち出し袋チェッカー / ユーザー=備蓄放置世帯 / 課題=備えたつもりの期限切れ / UC 5 件 / 規模=数十〜100品目 / 同時利用=低 / 外部連携=MVPなし / NFR=軽量・機微医療扱わない / 技術=Neon スタック"
  chosen_type: auto-recommended
  depends_on: [D20260526-001]
  context: |
    wants.md(I20260526-008 由来)が Q1-Q10 を網羅的に記載済。確認形式で採用。

- id: D20260526-003
  timestamp: 2026-05-26T19:52:00+09:00
  command: /flow:concept
  phase: Step 2 / MVP スコープ(設計フォーク)
  question: MVP に家族共有を含めるか
  options:
    - "個人単位 MVP、家族共有は v2 (recommended)"
    - "初版から家族共有を含める"
  recommended: "個人単位 MVP、家族共有は v2"
  chosen: "個人単位 MVP、家族共有は v2"
  chosen_type: explicit-choice
  depends_on: [D20260526-002]
  context: |
    家族共有は招待フロー/共同編集の競合解決/監査が加わり 1-2 ヶ月 1 人開発の timeline を圧迫。
    核価値(備蓄の鮮度管理)は単一ユーザーで完結。ユーザーが推奨案を選択。

- id: D20260526-004
  timestamp: 2026-05-26T19:52:30+09:00
  command: /flow:concept
  phase: Step 2 / Q12.6 アナリティクス
  question: アナリティクス・計測ツールを使うか
  options: ["Sentry + 自前コストログのみ (recommended)", "GA4 等行動分析も追加"]
  recommended: "Sentry + 自前コストログのみ"
  chosen: "Sentry(エラー監視) + 自前コストログ(§4.6)。GA4 等行動分析は入れない"
  chosen_type: auto-recommended
  depends_on: [D20260526-002, D20260526-003]
  context: |
    個人ツール。Cookie バナー実装コスト回避(hana-memo と同方針)。コスト追跡は §4.6 で必須。

- id: D20260526-005
  timestamp: 2026-05-26T19:53:00+09:00
  command: /flow:concept
  phase: Step 2 / Q12.7 共通機能(通知/お問い合わせ/監査)
  question: 通知・お問い合わせ・監査の方針
  options: []
  recommended: "通知=メール+アプリ内、お問い合わせ=メール/フォーム、監査=v1不要"
  chosen: "通知=Resend メール + アプリ内通知(Web Push 不採用、iOS 不安定+中毒性回避)。お問い合わせ=シンプルなメール/フォーム。監査=単一ユーザー MVP のため v1 不要(家族共有 v2 で再検討)。認証=Clerk ゲスト/段階的認証"
  chosen_type: auto-recommended
  depends_on: [D20260526-003]
  context: |
    単一ユーザー MVP のため監査(共同編集トレース)不要。通知は季節点検リマインドが核機能。

- id: D20260526-006
  timestamp: 2026-05-26T19:53:30+09:00
  command: /flow:concept
  phase: Step 2 / Q12.9 Git
  question: Git リポジトリ・運用方針
  options: []
  recommended: "GitHub private / trunk-based + protected main / Conventional Commits"
  chosen: "GitHub private、trunk-based + protected main、Conventional Commits、auto_commit=true、ja"
  chosen_type: auto-recommended
  depends_on: []
  context: preferences §2.8(GitHub Actions + Vercel Preview、2 PJ 採用)に整合。

- id: D20260526-007
  timestamp: 2026-05-26T19:54:00+09:00
  command: /flow:concept
  phase: Step 2 / Q12.10 公開戦略
  question: ドメイン・公開構成
  options: []
  recommended: "既存ドメインのサブドメ + Vercel 完結(PaaS)"
  chosen: "bousai.<既存ドメイン> サブドメ運用、Vercel 完結(リバプロ不要)、撤退は DNS 1 行削除"
  chosen_type: auto-recommended
  depends_on: []
  context: perspectives O29 撤退リスク最小化。新規ドメイン取得しない。

- id: D20260526-008
  timestamp: 2026-05-26T19:54:10+09:00
  command: /flow:concept
  phase: Step 2 / Q12.11 公開周知
  question: マーケティング戦略
  options: []
  recommended: "note + X(Build in Public)+ SEO、新規 SNS 開設なし"
  chosen: "note(防災 Tips/使い方)+ X(既存活動)+ SEO(防災 備蓄 管理 アプリ)。製品内グロースは控えめ、不安煽り禁止"
  chosen_type: auto-recommended
  depends_on: []
  context: perspectives O31 + charter §2.2(不安煽り回避)。

- id: D20260526-009
  timestamp: 2026-05-26T19:54:20+09:00
  command: /flow:concept
  phase: Step 2 / Q12.12 デザイン方向
  question: デザインの世界観
  options: []
  recommended: "穏やか/信頼感/淡々(不安煽らない)、落ち着いた緑/青系"
  chosen: "穏やか・信頼感・淡々。落ち着いた緑/青系、中立サンセリフ、OSS アイコン+自作 SVG。詳細は /flow:design"
  chosen_type: auto-recommended
  depends_on: [D20260526-002]
  context: concept の世界観から導出(O39)。災害恐怖を演出しない。

- id: D20260526-010
  timestamp: 2026-05-26T19:54:30+09:00
  command: /flow:concept
  phase: Step 2 / Q12.13 フィードバック導線
  question: ユーザーフィードバック導線
  options: []
  recommended: "👍/👎 + バグ報告ウィジェット、PII scrub、hub は将来"
  chosen: "好き嫌い + バグ報告ウィジェット(feedback 機能フォルダ)。送信前 PII scrub。中央 feedback-hub は未構築のため MVP は自前 DB + 運用通知のみ([論点-002])"
  chosen_type: auto-recommended
  depends_on: [D20260526-003]
  context: perspectives O40。hub 未構築は §8 論点登録。

- id: D20260526-011
  timestamp: 2026-05-26T19:54:40+09:00
  command: /flow:concept
  phase: Step 3 / §1.3 フォルダ構造 + 優先度
  question: ドキュメントフォルダ分割と優先度
  options: []
  recommended: null
  chosen: "機能4(inventory/inspection/shopping-list/feedback) + 横断7(_shared/{db,ui,auth,notification,legal,service-info,billing})。topological sort で P1-P4 算出、循環なし"
  chosen_type: auto-recommended
  depends_on: [D20260526-002, D20260526-003]
  context: UC とアーキテクチャから機能境界を導出。inventory が基盤(他機能が参照)。

- id: D20260526-012
  timestamp: 2026-05-26T19:55:00+09:00
  command: /flow:concept
  phase: Step 5.47 / SCENARIO 種別
  question: 開発シナリオ種別
  options: ["新規 MVP 立ち上げ (recommended)", "個人ツール", "ライブラリ公開"]
  recommended: "新規 MVP 立ち上げ"
  chosen: "新規 MVP 立ち上げ(UI あり PWA、公開 + PWYW)。Phase 1.5 デザインを含む"
  chosen_type: auto-recommended
  depends_on: [D20260526-002]
  context: §1.2 = 新規 MVP + 公開予定 + UI あり → 新規 MVP 立ち上げシナリオ。

- id: D20260526-013
  timestamp: 2026-05-26T19:55:20+09:00
  command: /flow:concept
  phase: Step 7.5 / preferences 更新
  question: preferences.md を更新するか
  options: ["全更新 (recommended)", "個別更新", "更新しない"]
  recommended: "全更新"
  chosen: "更新保留 → Step 7.5 でユーザーに 1 問確認予定(Neon/Clerk/Drizzle/Resend を採用 2/初採用として計上候補)"
  chosen_type: open
  depends_on: [D20260526-001]
  context: |
    本 PJ で Neon/Clerk/Drizzle が採用 2 へ、Resend(メール)が初採用。preferences 更新は
    ユーザー承認後に実施(暗黙更新禁止)。Step 7.5 で確認。

- id: D20260526-014
  timestamp: 2026-05-26T19:55:40+09:00
  command: /flow:concept
  phase: Step 7.7 / Git 自動コミット
  question: Git init + 自動コミット
  options: []
  recommended: ".git 不在のため git init を 1 問確認 → 確認後 commit"
  chosen: "(ユーザー確認待ち) — .git 不在のため git init の可否を確認してから commit"
  chosen_type: open
  depends_on: [D20260526-006]
  context: git-commit-policy §1。新規 PJ で .git 不在、自動 init はしない方針。
```
