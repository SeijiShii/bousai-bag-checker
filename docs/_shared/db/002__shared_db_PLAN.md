# _shared/db 実装計画書 (横断基盤)

> **入力**: `./001__shared_db_SPEC.md`, `../../concept.md` §1.4 / §4.3 / §3.1(SEC-001)
> **最終更新**: 2026-05-26

---

## 1. 実装対象ファイル一覧 (src/db/)

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/db/schema.ts` | Drizzle テーブル定義 (7 テーブル) + pgEnum 群 + インデックス | drizzle-orm/pg-core | 180 |
| `src/db/enums.ts` | category / freshness_type / reason / feedback type の pgEnum 値の単一定義 (アプリ層 Zod と共有) | — | 40 |
| `src/db/client.ts` | Neon serverless driver + drizzle インスタンス生成 (DATABASE_URL から、サーバー専用) | @neondatabase/serverless, drizzle-orm | 40 |
| `src/db/owner.ts` | **withOwner(userId)** 所有者強制クエリヘルパ (SEC-001) | client, schema | 120 |
| `src/db/migrate.ts` | `runMigrations()` (drizzle-kit migrate ラッパ、CI/起動前) | drizzle-orm/.../migrator | 30 |
| `src/db/index.ts` | 公開エクスポート (db / withOwner / 型) | 上記 | 20 |
| `src/types/db.ts` | Insert/Select 型の再エクスポート (Drizzle 推論) | schema | 30 |
| `drizzle.config.ts` | drizzle-kit 設定 (schema パス / out / dialect=postgresql / DATABASE_URL) | drizzle-kit | 20 |
| `src/db/migrations/*` | 生成 SQL (drizzle-kit generate) | — | (自動生成) |

> 言語・FW: concept §4.3 確定の TypeScript + Drizzle + Neon。`VITE_` プレフィックス禁止 (SEC-005、クライアントバンドルに DATABASE_URL を含めない)。

## 2. 実装 Phase 分割 (/flow:tdd 連携、injectable + interface default = O35)

### Phase 1 (RED→GREEN→IMPROVE): enums + schema 定義
- 対象: `enums.ts` + `schema.ts` (7 テーブル + index)
- テスト対象: テーブル/カラム/enum/default/制約のスキーマ整合 (型レベル + drizzle メタ)
- ゴール: スキーマがコンパイル + Insert/Select 型が引ける

### Phase 2: client (injectable)
- 対象: `client.ts` — `createDb(connectionString)` を export し、`db` は env 経由で生成。テストは mock 接続 or pglite を注入。
- ゴール: DB クライアントが env から生成でき、テストでは差し替え可能 (injectable)

### Phase 3: withOwner 所有者強制ヘルパ (SEC-001、最重要)
- 対象: `owner.ts` — `withOwner(userId)` が user-scoped テーブル (items/notification_settings/inspection_logs/shopping_items) の find/findById/insert/update/delete を user_id 強制で提供。
- テスト対象: 所有者分離 (他人の id で null / 0 行)、insert 時の user_id 付与。
- ゴール: cross-tenant アクセスが構造的に不可能 (IDOR 防止)

### Phase 4: migrate + config + 初期マイグレーション生成
- 対象: `migrate.ts` + `drizzle.config.ts` + `drizzle-kit generate` で初期 SQL 生成
- ゴール: `npm run db:migrate` で Neon dev ブランチにスキーマ適用 (ローカル/CI=Class A、本番適用は /flow:release=Class B)

> donations / feedback は user_id nullable のため withOwner 非経由。書き込みは通常の db インスタンス経由 (Phase 2 でカバー)、ゲスト可。

## 3. 依存関係順序

```
enums.ts → schema.ts → client.ts → owner.ts → index.ts
                          schema.ts → migrate.ts (drizzle-kit)
                          schema.ts → types/db.ts
```
本基盤は依存先なし (concept §1.3.4 P1)。

## 4. 既存ファイルへの影響
新規 PJ のため既存影響なし。本基盤が後続全機能 (inventory/inspection/shopping-list/feedback/notification/billing) のスキーマ + 所有者ヘルパの基礎になる。

## 5. 横断フォルダへの追加・変更
- 本フォルダが定義元。他横断 (_shared/auth) は withOwner に渡す userId を供給する関係。

## 6. リスク・注意点
- **SEC-001 強制の徹底**: 生クエリ (`db.select().from(items)` を user_id フィルタなし) を書けてしまう余地が残る。lint ルール or レビュー観点で「user-scoped テーブルは withOwner 経由のみ」を担保 (UNIT_TEST にも所有者分離ケースを必須化)。
- **Neon serverless 接続**: Vercel Functions の短命接続。`@neondatabase/serverless` の HTTP/WS ドライバを使い、コネクション枯渇を避ける。
- **マイグレーションの本番適用は Class B**: 破壊的変更の実 DB apply は /flow:release で人間確認。ローカル/CI の dev ブランチ適用は Class A。
- **論点-S-db-1 (freshness_type)**: inventory 設計時に最終確定。スキーマは案A前提で可逆 (未使用カラムが残るだけ)。

## 7. 完了の定義 (DoD)
- [ ] 7 テーブル + enums + index が schema.ts に定義済
- [ ] withOwner が所有者分離テストを通過 (SEC-001)
- [ ] client が injectable (テストで mock 差し替え可)
- [ ] `npm run db:migrate` で dev ブランチにスキーマ適用成功
- [ ] 単体テストカバレッジ 80%/70% 達成
- [ ] 統合テストは feature 側 E2E でカバー (cross-cutting のため本フォルダ E2E なし)

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (7 テーブル + withOwner + 4 Phase) | /flow:feature |
