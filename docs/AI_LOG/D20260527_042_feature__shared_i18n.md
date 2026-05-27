# AI_LOG セッション D20260527_042 — /flow:feature _shared/i18n

**実行日時**: 2026-05-27 16:30 (+09:00)
**コマンド**: /flow:feature _shared/i18n (設計判断確定済、再ヒアリングなし)
**状態**: 完了
**含まれる decision**: D20260527-102
**起動元**: ユーザー i18n 要件 (D-100/101) → concept 更新 (D-101) → 設計
**depends_on**: D20260527-101 (i18n 設計判断), D20260527-034/064 (ui/screens 既存実装)
**Resume Contract 準拠**

---

## 主要決定サマリ
- _shared/i18n の設計 4 文書 (SPEC/PLAN/UNIT_TEST/E2E) を生成
- 提供 IF: i18n init / useTranslation t() / useLocale / LanguageSwitcher / format / enum ラベル
- カタログ: src/i18n/locales/{ja,en,zh-Hans,ko}.json、ドットネストキー、ja 正本
- 文字列抽出インベントリ ~50 キー (承認済み wording 校正 4 件を ja 値に反映済: 種類/管理のしかた/買い物リストを作る/問題なし)
- 検出: localStorage → navigator(正規化) → ja。切替即時 + 永続 + html lang 同期
- enum 生値表示の不具合 (ItemForm option が water/food 表示) も labels.ts で同時解消
- 法務は JA 正本 (非 ja で「正本は日本語」注記、本文 JA フォールバック)
- E2E は言語切替ジャーニー S1-S7 (cross-cutting だが UI ジャーニーありで生成)

## 生成・更新ファイル
- `docs/_shared/i18n/001..004` (4 設計文書) + INDEX
- `docs/AI_LOG/D20260527_042_feature__shared_i18n.md` (本ファイル) + INDEX
- `docs/INDEX.md` (i18n を設計済に)

## 次のステップ (flow)
1. `/flow:spec-review _shared/i18n` (P3.7、実コード調査 + 設計レビュー)
2. `/flow:tdd` (実装: deps 追加 → 基盤 → 翻訳 → Switcher → t() 置換 → 法務注記)
3. deps 追加後 `/flow:secure --phase=deps` 再実行 (鮮度)
4. `/flow:e2e _shared/i18n` (切替ジャーニー)
5. `/flow:wording` (JA カタログ校正 + en/zh/ko 訳レビュー、本来の Wording gate)

---

## decisions

### D20260527-102
- question: _shared/i18n の設計 (IF / カタログ / 抽出インベントリ / Phase 分割)
- chosen: react-i18next 基盤 + 4 ロケール JSON(ja 正本) + useLocale/LanguageSwitcher/format/labels、~50 文字列をキー化(校正4件反映)、5 Phase 実装計画。E2E は切替ジャーニー。法務 JA 正本。enum 生値表示も同時解消
- chosen_type: auto-recommended (設計判断は D-101 で確定済、SPEC は機械的展開)
- context: D-101 の 4 決定を SPEC/PLAN に展開。キー集合一致を unit 品質ゲート化。既存 UI 全置換 + テスト追従が Phase 4 の主作業
- depends_on: [D20260527-101]
