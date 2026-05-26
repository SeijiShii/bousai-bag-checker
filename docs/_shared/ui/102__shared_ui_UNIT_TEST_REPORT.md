# 単体テストレポート: _shared/ui

## 実施日時
2026-05-27 (JST)

## 関連ドキュメント
- [003__shared_ui_UNIT_TEST.md]

## テスト実行環境
- vitest 2.1.9 + @testing-library/react 16 + jsdom 25 (.test.tsx は jsdom 環境)
- React 18 / @vitejs/plugin-react

## テスト結果
| # | テストケース | ファイル | 結果 |
|---|---|---|---|
| U-N1 | tokens.primary = #2E8B74 | tokens.test.ts | ✅ |
| U-N3 | 鮮度3段階の状態色がトークン通り | tokens.test.ts | ✅ |
| — | 純赤を状態色に使わない | tokens.test.ts | ✅ |
| — | 鮮度状態 fresh/warn/expired | tokens.test.ts | ✅ |
| U-N3 | StatusChip data-status + ラベル + svg | status-chip.test.tsx | ✅ |
| — | warn/expired の data-status・ラベル | status-chip.test.tsx | ✅ |
| U-B1 | StatusChip 絵文字不使用 | status-chip.test.tsx | ✅ |
| U-N2 | Button role + 名前 + variant クラス | button.test.tsx | ✅ |
| U-E2 | Button disabled クリック無効 | button.test.tsx | ✅ |
| U-B2 | Button 44px タップ領域 | button.test.tsx | ✅ |
| U-N4 | Field label 関連付け | field.test.tsx | ✅ |
| U-E1 | Field error 色 + aria-invalid + 補足文 | field.test.tsx | ✅ |
| U-N5 | InfoButton 開閉 + concept 由来説明 (O41) | info-button.test.tsx | ✅ |

## 追加テストケース
追加テストケースなし。

## サマリー
| 項目 | 値 |
|---|---|
| 計画テスト数 | 13 |
| 追加 | 0 |
| 合計 | 13 |
| 成功 | 13 |
| 失敗 | 0 |
| 成功率 | 100% |

> 視覚崩れ・レイアウト・コントラストの総合検証は unit 非対象 → 画面実装後 `/flow:design --review-only` (headless スクショ) で担保 (設計どおり)。
