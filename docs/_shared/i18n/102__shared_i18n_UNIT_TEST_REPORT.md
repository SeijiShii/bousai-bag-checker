# 単体テストレポート: _shared/i18n

## 実施日時
2026-05-27 (JST)

## 関連ドキュメント
- 003__shared_i18n_UNIT_TEST.md (計画)

## テスト実行環境
- vitest 2.1 (.ts=node, .tsx=jsdom) / React 18 / i18next 26 + react-i18next 17

## テスト結果

| # | テストケース | ファイル | 結果 |
|---|---|---|---|
| U-N1/2/3 | normalizeLocale (ja/en-US/zh-CN/zh/ko-KR/fr/null/undefined) | i18n/config.test.ts | ✅ |
| U-B1 | **catalog キー集合一致 (en/zh-Hans/ko が ja と完全一致、品質ゲート)** | i18n/config.test.ts | ✅ |
| U-N6 | formatDate / formatNumber | i18n/config.test.ts | ✅ |
| U-N7 | categoryLabel / freshnessLabel (enum→ロケールラベル) | i18n/config.test.ts | ✅ |
| U-N8 | 承認済み校正反映 (種類/管理のしかた/買い物リストを作る/問題なし) | i18n/config.test.ts | ✅ |
| U-B2 | interpolation (deleteAria 完全文) | i18n/config.test.ts | ✅ |
| U-N5 | useLocale: setLocale 切替+localStorage 永続+html lang 同期 | i18n/useLocale.test.tsx | ✅ |
| U-E2 | 未対応ロケールは無視 | i18n/useLocale.test.tsx | ✅ |
| — | locales = 4 言語 | i18n/useLocale.test.tsx | ✅ |

## 追加テストケース
- test setup の ja 既定化 (jsdom navigator=en-US 対策) により既存 ~11 component test が ja で安定。変更文字列 5 件 + legal labelKey の追従更新。

## サマリー
| 項目 | 値 |
|------|-----|
| i18n 新規テスト | 11 件 |
| 全体テスト | 156 件 (145→156) |
| 成功 | 156 件 |
| 失敗 | 0 件 |
| 成功率 | 100% |
| typecheck | clean |
| build | OK (gzip 100.8KB) |
