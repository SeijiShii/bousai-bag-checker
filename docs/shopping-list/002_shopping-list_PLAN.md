# shopping-list 実装計画書

> **入力**: `./001_shopping-list_SPEC.md`, `../concept.md` §1.4 / §4.3
> **最終更新**: 2026-05-27

---

## 1. 実装対象ファイル一覧 (src/features/shopping-list/)

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `shoppingRepository.ts` | shopping_item CRUD (withOwner) | db | 80 |
| `generate.ts` | 期限切れ/不足 items → shopping_item 生成。**inventory.freshness を import(再実装禁止)。既存の未購入 shopping_item とマージして重複生成を防止** <!-- spec-review R1/R2: freshness再利用 + generate冪等(重複防止) --> | inventory(freshness) | 70 |
| `csvExport.ts` | CSV 生成 + インジェクションエスケープ (SEC-003) | — | 50 |
| `api/shopping/*.ts` | CRUD + generate + export API | repo | 110 |
| `ShoppingList.tsx` | TODO リスト (未購入/購入済 + チェック) | ui | 120 |
| `useShopping.ts` | フック | — | 50 |

## 2. 実装 Phase 分割 (/flow:tdd 連携)

### Phase 1 (RED→GREEN→IMPROVE): generate + csvExport (純ロジック)
- 対象: `generate.ts` + `csvExport.ts`
- テスト対象: 期限切れ/不足抽出 (freshness 流用)、CSV インジェクションエスケープ (`=`/`+`/`-`/`@`)
- ゴール: 生成 + 安全な CSV (SEC-003)

### Phase 2: shoppingRepository + API (withOwner)
- 対象: `shoppingRepository.ts` + `api/shopping/*`
- テスト対象: CRUD/generate/export が withOwner、他人 id で 404、is_bought 更新
- ゴール: 所有者強制 CRUD + 生成 + エクスポート

### Phase 3: UI (ShoppingList/useShopping)
- 対象: TODO リスト + 購入チェック + 生成ボタン + エクスポート
- テスト対象: 未購入/購入済の区別、チェックで is_bought、EmptyState、生成
- ゴール: 買い物 TODO UI が render + 操作。視覚は /flow:design --review-only

## 3. 依存関係順序
```
inventory(freshness) + db + ui → generate/csvExport → repo/api → UI
```
依存先: inventory/db/ui (設計済)。**_shared/billing 依存なし**(D-028 で無料化、課金ゲート削除)。

## 4. 既存ファイルへの影響
- BottomNav に買い物タブ。

## 5. 横断フォルダへの追加・変更
| 横断フォルダ | 追加・変更内容 |
|---|---|
| _shared/db | shopping_item CRUD (スキーマ既存) |

## 6. リスク・注意点
- **SEC-003 (論点-006)**: CSV エクスポートで `=`/`+`/`-`/`@` 始まりセルをエスケープ (CSV インジェクション防止)。
- **SEC-001**: shopping_item を withOwner 経由。
- **D-028**: 課金ゲートを入れない (無料機能)。billing 依存なし。
- 生成の重複防止 (既存 shopping_item と重複しないマージ)。

## 7. 完了の定義 (DoD)
- [ ] generate が期限切れ/不足を抽出
- [ ] csvExport がインジェクションエスケープ (SEC-003)
- [ ] shoppingRepository/API が withOwner (IDOR 防止)
- [ ] TODO リスト UI (未購入/購入済 + チェック + 生成 + エクスポート)
- [ ] 単体テストカバレッジ 80%/70% (CSV エスケープ + 所有者分離重点)
- [ ] E2E (004) は /flow:e2e で green
- [ ] 課金ゲートが無いこと (無料、D-028)

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (generate/csv→repo/api→UI の 3 Phase、無料・CSV安全) | /flow:feature |
