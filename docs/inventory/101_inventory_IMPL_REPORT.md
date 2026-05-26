# 実装レポート: inventory

## 実装日時
2026-05-27 (JST) / **モード**: feature

## 関連ドキュメント
- 001-004 + 905 (inventory) / [AI_LOG](../AI_LOG/D20260527_027_tdd_inventory.md)

## 変更一覧
- `freshness.ts`(spec-review R1 共有所有者): computeFreshness/freshnessDueDate/isDue。**inspection/shopping-list が import**
- `itemSchema.ts`(Zod、SEC-003、enum は db/enums 由来): freshness 種別別の必須(expiry→期限 / replace_guide→月数)
- `inventoryService.ts`: create(検証→withOwner.insert)/listWithFreshness(鮮度合成、lead_days 連動 R4)/remove(IDOR防止)
- UI: `ItemList.tsx`(StatusChip/EmptyState/削除)/`ItemForm.tsx`(freshness 種別で動的フィールド + 検証エラー)

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| TDD で発見 | computeFreshness が `now` の時刻で当日期限を expired 化するバグ → カレンダー日比較(Date.UTC)に修正 |
| 後段 | CRUD API エンドポイント + R2 写真アップロードは app shell bootstrap(全機能の api 配線時)+ release(R2 実キー)。視覚総合は /flow:design --review-only |

## PR Description
### 概要
品目 CRUD の中核。3種 freshness(論点-001 案A、他機能が再利用)+ Zod 検証 + 所有者強制 + 一覧/フォーム UI。
### テスト
18 テスト green(freshness 3種×状態 / 検証 / 所有者分離 IDOR / UI 操作)。typecheck clean。
