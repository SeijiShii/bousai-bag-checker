# 実装レポート: shopping-list

## 実装日時
2026-05-27 (JST) / **モード**: feature

## 関連ドキュメント
- 001-004 + 905 / [AI_LOG](../AI_LOG/D20260527_030_tdd_shopping-list.md)

## 変更一覧
- `csvExport.ts`: CSV インジェクションエスケープ(=/+/-/@ 前置 + カンマ/引用符/改行クオート、SEC-003/R3)
- `makeShopping.ts`: generate(inventory.freshness で期限切れ/近い抽出 → shopping_item、**既存未購入とマージで重複防止 R2**)/addManual/list/setBought/remove(withOwner、IDOR防止)
- `ShoppingList.tsx`: 未購入/購入済 + 生成/CSV。**課金導線なし(無料、D-028)**

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| 無料 | 課金ゲート無し(D-028)。UI に 100円/購入/アンロック文言が無いことをテスト |
| 後段 | /api/shopping エンドポイント配線は app shell bootstrap |

## PR Description
### 概要
買い物 TODO(無料)。期限切れ/近い品目から生成(重複防止)+ 購入チェック + CSV(インジェクション安全)。
### テスト
11 テスト green(CSV エスケープ 4 + generate/重複防止/所有者 4 + UI 3)。typecheck clean。
