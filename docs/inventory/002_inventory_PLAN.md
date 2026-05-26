# inventory 実装計画書

> **入力**: `./001_inventory_SPEC.md`, `../concept.md` §1.4 / §4.3
> **最終更新**: 2026-05-27

---

## 1. 実装対象ファイル一覧 (src/features/inventory/)

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `itemRepository.ts` | items CRUD ラッパ (withOwner 経由) | db | 90 |
| `freshness.ts` | 鮮度算出 (expiry/replace_guide/check_only → fresh/warn/expired)。**inventory 単一所有、inspection/shopping-list は import(重複禁止)。lead_days を引数に取る** <!-- spec-review R1/R4: freshness 共有ヘルパ化 + lead_days 連動 --> | lib(date) | 70 |
| `itemSchema.ts` | Zod 入力スキーマ (SEC-003 一元化)。**API+フォーム単一ソース、enum は db/enums.ts 由来(二重定義回避)** <!-- spec-review R2 --> | zod | 60 |
| `api/items/index.ts` / `[id].ts` | CRUD API (requireUser + withOwner) | repo, auth | 120 |
| `api/items/photo.ts` | R2 写真アップロード(**サーバープロキシ方式**、R2鍵をクライアント露出しない SEC-005) <!-- spec-review R3: presigned でなく server proxy --> | R2 | 60 |
| `ItemList.tsx` | 一覧 + StatusChip + EmptyState | ui | 120 |
| `ItemForm.tsx` | 登録/編集フォーム (freshness 種別で動的) | ui | 150 |
| `ItemCard.tsx` | 品目カード | ui | 60 |
| `useItems.ts` | データ取得フック | — | 60 |

## 2. 実装 Phase 分割 (/flow:tdd 連携、injectable + interface default = O35)

### Phase 1 (RED→GREEN→IMPROVE): freshness + itemSchema (純ロジック)
- 対象: `freshness.ts` + `itemSchema.ts`
- テスト対象: 3種 freshness → 鮮度3段階の算出 (lead_days 考慮)、Zod 検証 (必須/範囲/freshness 別必須)
- ゴール: 鮮度ロジック + 入力検証が純関数で通る

### Phase 2: itemRepository (withOwner、mock db)
- 対象: `itemRepository.ts`
- テスト対象: CRUD が withOwner 経由、他人の item アクセスで null/0行 (IDOR)
- ゴール: 所有者強制 CRUD

### Phase 3: API endpoints (requireUser)
- 対象: `api/items/*` + `api/items/photo`
- テスト対象: 401/404(IDOR)/400(検証)、R2 アップロード(mock)
- ゴール: API が認可 + 検証 + 所有者分離で通る

### Phase 4: UI (ItemList/ItemForm/ItemCard/useItems)
- 対象: 画面コンポーネント
- テスト対象: 一覧表示、StatusChip 3段階、フォーム検証表示、EmptyState、freshness 種別で動的フォーム
- ゴール: 画面が render + 操作テスト通過。視覚レビューは /flow:design --review-only

### Phase 3.5: bootstrap (該当分)
- R2 SDK install + `.env.example` に `R2_*` 追記。Vercel Functions 配線。

## 3. 依存関係順序
```
db(items,withOwner) + auth(requireUser) + ui → freshness/itemSchema → itemRepository → api → UI
```
依存先: db/auth/ui (全て設計済)。

## 4. 既存ファイルへの影響
- BottomNav に品目タブ (ui)。共通レイアウトに組み込み。

## 5. 横断フォルダへの追加・変更
| 横断フォルダ | 追加・変更内容 |
|---|---|
| _shared/db | items への withOwner CRUD (スキーマは既存) |
| _shared/ui | ItemCard 等は features 側、汎用部品は ui |

## 6. リスク・注意点
- **SEC-001**: 全 items アクセスを withOwner 経由に固定 (生クエリ禁止)。
- **SEC-003 (論点-006)**: itemSchema で入力一元検証。CSV インジェクションは shopping-list 側 (エクスポート時)。
- **保管場所は防犯情報**: ログ/エラーに出さない (SEC-002)。
- 写真の R2 サイズ上限 + 遅延ロード (無料枠 + 性能)。

## 7. 完了の定義 (DoD)
- [ ] freshness 算出 + itemSchema 検証が通る
- [ ] itemRepository が withOwner で IDOR 防止
- [ ] CRUD API が 401/404/400 + R2 を正しく処理
- [ ] UI (一覧/フォーム/カード/空状態) が render + 操作テスト通過
- [ ] 単体テストカバレッジ 80%/70% (所有者分離は重点)
- [ ] E2E (004) は /flow:e2e で green、視覚レビューは /flow:design --review-only

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (freshness→repo→api→UI の 4 Phase) | /flow:feature |
