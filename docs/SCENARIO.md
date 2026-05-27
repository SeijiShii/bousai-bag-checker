# 持ち出し袋チェッカー 開発シナリオ

**最終更新**: 2026-05-27 16:05
**生成元**: /flow:concept (初回) / /flow:scenario (更新)
**シナリオ種別**: 新規 MVP 立ち上げ (UI あり PWA、公開 + 100円の投げ銭/任意支援)

> 本ファイルは AI が「次に何をすべきか」を判断する際の参照ドキュメント。
> §5 現在地カーソルは flow コマンドが auto-generated 範囲で書き換える。それ以外はユーザー編集可。

---

## 1. ゴール
防災備蓄の「鮮度管理」に特化した単一ユーザー PWA を、1〜2 ヶ月・1 人開発・無料枠で公開する。家族共有は v2。期限リマインドと季節点検で「備えたつもり」を実効性ある状態に保つ。

## 2. 進行フェーズ

1. **Phase 1: 概念設計** — concept.md + SCENARIO.md 確定 ✅(本セッションで完了)
2. **Phase 1.5: デザインシステム** — concept の世界観(穏やか/信頼感/淡々)から `docs/design/design-system.md` を導出 + スタイル基盤適用。`/flow:design`
3. **Phase 2: 機能設計** — §1.3 優先度順に SPEC+PLAN+UNIT_TEST+E2E_TEST 生成(基盤 _shared から)
4. **Phase 3: 実装** — TDD で各機能実装。画面実装後に視覚デザインレビュー(Design gate)
5. **Phase 4: 公開準備** — audit + secure(deps) + 法務書類(_shared/legal) + PR
6. **Phase 5: 公開後運用** — claim 受付 / fix / revise の循環。v2(家族共有)検討

## 3. 各フェーズで使う flow コマンド + 完了ゲート

### Phase 1: 概念設計 ✅
- 主コマンド: `/flow:concept`(完了)
- 次: `/flow:secure --phase=design --scope=concept`(L1 設計レビュー)
- 見積(1 回目): `/flow:estimate`
- 完了ゲート: concept.md 全節 + secure Critical/High closed + initial 見積

### Phase 1.5: デザインシステム (UI あり)
- 主コマンド: `/flow:design`
- 完了ゲート: `docs/design/design-system.md` 生成 + トークンがスタイル基盤に反映

### Phase 2: 機能設計
- 主コマンド: `/flow:feature <target>`(優先度順: _shared/db → ui → auth → notification → service-info → legal → billing → inventory → feedback → inspection → shopping-list)
- 各機能ごと: `/flow:secure --phase=design --scope=feature_<target>`
- 見積(2 回目): 最初の 1 feature 完了直後に `/flow:estimate` 再校正
- 完了ゲート: 全機能の 001〜004 文書 + Critical/High 解決

### Phase 3: 実装
- 主コマンド: `/flow:tdd`(連続実装)
- secure: `/flow:secure --phase=pre-impl`(実装前 1 回)+ `--phase=deps`(依存追加時)
- 完了ゲート: 全機能 101/102 + テスト通過 + Phase 単位コミット

### Phase 4: 公開準備
- 主コマンド: `/flow:audit` + `/flow:secure --phase=deps` + `security-review`
- 法務: `_shared/legal`(プライバシー/利用規約/特商法)を公開前に整備
- リリース: `/flow:release`(実キー FILL → ローカル動作確認 → デプロイ)
- 完了ゲート: 本番デプロイ + 法務書類公開

### Phase 5: 公開後運用 (循環)
- バグ報告 → `/flow:claim` → `/flow:fix` or `/flow:revise` → `/flow:tdd` → PR
- v2: 家族共有(招待 + 共同編集 + 競合解決 + 監査)を `/flow:revise` or `/flow:feature` で

## 4. 分岐ルール

| イベント | 切替先 | 戻り先 |
|---|---|---|
| Critical/High SEC finding | `/flow:revise` or `/flow:fix` | 元 Phase |
| ユーザークレーム | `/flow:claim` で判定 | 判定先 |
| 設計 drift(audit) | `/flow:revise` | 元 Phase |
| 依存 Critical CVE | `/flow:fix` | 元 Phase |

## 5. 現在地カーソル

<!-- AUTO-GENERATED:BEGIN scenario-cursor -->
- 現在フェーズ: Phase 4 (公開準備) — 実装完了、リリース工程待ち
- 進行中ターゲット: なし (全 11 ターゲット実装完了)
- 最終更新セッション: D20260527_038_scenario_update (auto loop D20260527_035 経由)
- 最終更新時刻: 2026-05-27 16:05
- 完了フェーズ: [Phase 1, Phase 1.5, Phase 2 (機能設計 全 11), Phase 3 (実装: unit 145 + E2E 11 + 視覚デザインレビュー、全 green)]
- 次の推奨コマンド: /flow:wording (P4.45 Wording gate、未実行 — UI コピー校正) → /flow:release (P4.7、実キー FILL + ローカルスマホ動作確認 + デプロイ)
- 備考: リリース前 full 監査済 (AUDIT_20260527_1549、検出 High=O48 service-info エンドポイント未配線 → D-037 で api/service-info.ts 配線・解消済)。残はリリース工程 (Class C 実キー + Clerk/Stripe/Resend 配線 + Class B デプロイ) と wording (Class C コピー校正) で、いずれも人間主導が必要。課金=100円の投げ銭(任意支援、機能アンロックなし)
<!-- AUTO-GENERATED:END scenario-cursor -->

## 6. 変更履歴
- 2026-05-26: /flow:concept で初回生成(新規 MVP 立ち上げシナリオ、/flow:ideate から連鎖)
- 2026-05-27 16:05: /flow:scenario --update で §5 カーソルを reconcile (AUDIT-structure-001 drift シューティング、decision_id=D20260527-096)。実態 (全 11 実装完了 + unit 145/E2E 11/視覚レビュー green + full 監査済 + Release gate 到達) に同期。Phase 1.5 表記の stale を解消
