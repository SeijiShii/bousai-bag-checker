# AI_LOG セッション D20260527_046 — /flow:wording (i18n カタログ校正、P4.45)

**実行日時**: 2026-05-27 21:24 (+09:00)
**コマンド**: /flow:wording (i18n カタログベース)
**状態**: 完了
**含まれる decision**: D20260527-108
**起動元**: P4.45 Wording gate (i18n 完成 → catalog が新ソース → 再評価)。ユーザー選択
**depends_on**: D20260527-104 (i18n 実装)
**Resume Contract 準拠**

---

## 主要決定サマリ
- i18n カタログ (src/i18n/locales/ja.json = ソース) の全 ~60 キーを design-system ボイス (淡々・穏やか・急かさない・責めない) でレビュー
- **大半はオントーン**と確認 (O38/O41/O43 デザインレビュー + 前回承認の 4 校正が反映済)。低頻度防災ツールは明快さ優先のため機能ラベルは平易・明確を維持
- ユーザー判断で **1 件のみ校正**: `settings.leadDays`「何日前から知らせるか」→「何日前にお知らせするか」(丁寧・柔らか)。freshness ラベル等は明快さ優先で現状維持
- en/zh/ko は意味不変のため据え置き (4 ロケール parity 維持)。tdd で生成済みの faithful 訳をレビューし採用
- screens + i18n テスト green (17)、文字列を assert するテストなし

## 生成・更新ファイル
- `src/i18n/locales/ja.json` (settings.leadDays)
- `docs/AI_LOG/D20260527_046_wording_catalog.md` + INDEX

## 次のステップ
- P4.7 Release gate (実キー FILL + SDK 配線 + ローカルスマホ動作確認 + デプロイ、Class C/B)
- 公開する PJ のため Release 後に P4.8 Promote gate (告知文、要サブドメイン確定)

---

## decisions

### D20260527-108
- question: i18n カタログのトーン校正範囲
- chosen: 現状維持を基本とし settings.leadDays のみ「お知らせする」へ。freshness ラベル等は明快さ優先で据え置き。en/zh/ko は意味不変で parity 維持
- chosen_type: explicit-choice (ユーザー選択)
- context: カタログは既にオントーン (デザインレビュー + 4 校正反映済)。防災・低頻度利用ツールは明快さ優先のため過度な柔らか化はしない。コピーの声=人間判断 (Class C)
- depends_on: [D20260527-104]
