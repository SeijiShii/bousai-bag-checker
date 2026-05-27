# 実装レポート: _shared/i18n

## 実装日時
2026-05-27 18:xx (JST)

## モード
feature (cross-cutting)

## 関連ドキュメント
- 001_SPEC / 002_PLAN / 003_UNIT_TEST / 004_E2E_TEST / 905_SPEC_REVIEW
- [AI_LOG](../../AI_LOG/D20260527_044_tdd__shared_i18n.md)

## 変更一覧

### Phase 1-2: 基盤 + 4 ロケールカタログ
- `src/i18n/config.ts`: i18next init + `normalizeLocale`(zh-CN→zh-Hans 等) + `detectInitialLocale`(localStorage→navigator→ja)。fallbackLng=ja。**i18next-browser-languagedetector は型非互換 (convertDetectedLanguage 未対応) のため手動検出に変更し dep 削除** (計画差分)。
- `src/i18n/locales/{ja,en,zh-Hans,ko}.json`: 全 UI 文字列。ja 正本に承認済み wording 校正 4 件 (種類/管理のしかた/買い物リストを作る/問題なし) 反映。
- `src/i18n/useLocale.ts`: locale 取得 + setLocale (changeLanguage + localStorage 永続 + `<html lang>` 同期)。
- `src/i18n/format.ts`: formatDate/formatNumber (Intl)。`src/i18n/labels.ts`: enum→ラベルキー (生値表示の解消)。

### Phase 3: LanguageSwitcher + 配線
- `src/components/ui/language-switcher.tsx`: 4 言語 endonym ドロップダウン (ヘッダ配置)。
- `src/main.tsx`: `import './i18n/config'` で render 前初期化。

### Phase 4: 全 UI の t() 置換 (~15 file)
- AppHeader(+Switcher)/footer/bottom-nav/4 screens/ItemForm(+categoryLabel/freshnessLabel)/ItemList/StatusChip/FeedbackWidget/InspectionChecklist/ShoppingList/SettingsScreen/InfoButton。
- itemSchema/feedbackSchema: Zod message=i18n キー、表示層 (ItemForm) で `t(message)` (905 R3)。
- aria は完全文 interpolation (`inventory.deleteAria`/`shopping.toggleBoughtAria`/`inspection.checkAria`、905 R2)。

### Phase 5: 法務 JA 正本 + テスト追従
- `LegalView`: 非 ja ロケールで `legal.jaAuthoritative` 注記、本文は JA 維持。404/back-link も t()。
- `src/test/setup.ts`: テストを ja 既定化 (jsdom navigator=en-US 対策)。
- 変更文字列の test 追従 5 件 (status-chip/ShoppingList/screens/info-button/ItemList) + legal.test (labelKey)。

## 実装計画からの差分
| 項目 | 内容 |
|------|------|
| 計画にない追加 | spec-review で未検出だった `inspection.checkAria` / `inspection.recordedCount` / `common.notFound` / `common.backToTop` を実装中に発見しキー追加 (4 ロケール parity 維持) |
| 計画から変更 | i18next-browser-languagedetector を手動検出に置換 (型非互換) + dep 削除 |
| 想定外 | なし。catalog は static import (4 小 JSON、遅延ロードより単純で確実) |

## PR Description
### タイトル
i18n: 多言語基盤 (ja/en/zh-Hans/ko) + 全 UI 多言語化
### 概要
UI を 4 言語化する横断基盤。react-i18next + ロケール検出 + 言語切替 UI + 全 UI 文字列のカタログ化。法務長文は JA 正本。
### 変更内容
- i18n 基盤 (config/useLocale/format/labels) + 4 ロケール JSON
- LanguageSwitcher + 全 UI の t() 置換 + Zod エラーの i18n 化
- 法務ページの JA 正本注記
### テスト
156 tests green (i18n +11、キー集合一致を品質ゲート化) / typecheck clean / build OK / audit High 0。
