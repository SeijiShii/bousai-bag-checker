# 実装レポート: _shared/db

## 実装日時
2026-05-27 (JST)

## モード
feature (cross-cutting)

## 関連ドキュメント
- [001__shared_db_SPEC.md] / [002__shared_db_PLAN.md] / [003__shared_db_UNIT_TEST.md]
- [AI_LOG](../../AI_LOG/D20260527_020_tdd__shared_db.md)

## 変更一覧

### Phase 1: enums + schema
- `src/db/enums.ts`: 4 pgEnum + 値配列の単一定義 (item_category / freshness_type / shopping_reason / feedback_type)。Zod 共有用 (spec-review R2)
- `src/db/schema.ts`: 7 テーブル (users/items/notification_settings/inspection_logs/donations/shopping_items/feedback)。論点-001 案A の freshness_type、投げ銭 donations(user_id nullable, stripe_payment_id UNIQUE)、plan 廃止(D-028)。index: items(user_id), items(user_id, expires_at), inspection_logs(user_id), shopping_items(user_id)

### Phase 2: client (injectable)
- `src/db/client.ts`: `createDb(connStr)`(Neon serverless)+ `getDb()`(DATABASE_URL サーバー専用、VITE_ 禁止 SEC-005)。テストは pglite を注入

### Phase 3: withOwner (SEC-001)
- `src/db/owner.ts`: `makeOwner(db)(userId)` → items/inspectionLogs/shoppingItems の所有者強制 repo (findMany/findById/insert/update/remove)。id+user_id 複合で IDOR 防止。Neon RLS 非対応をアプリ層で代替

### Phase 4: migrate + 生成 SQL
- `drizzle.config.ts`(schema=[schema.ts, enums.ts]、enum CREATE TYPE 生成のため両方スキャン)+ `drizzle/0000_init.sql`(4 CREATE TYPE + 7 CREATE TABLE)+ `src/db/migrate.ts`(runMigrations、本番 apply は release)
- scaffold: package.json / tsconfig / vitest.config / .env.example

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| 計画にない追加 | scaffold 一式(greenfield のため。drizzle.config の schema を配列にして enum CREATE TYPE を生成) |
| 省略 | notifications/email_deliveries テーブルは notification 実装時に追加(SPEC どおり) |
| 想定外 | drizzle-kit が別ファイルの enum を拾わず CREATE TYPE 未生成 → schema 配列指定で解決 |

## PR Description
### タイトル
_shared/db: DB スキーマ基盤 + 所有者強制(SEC-001)
### 概要
全機能の基礎となる Neon/Drizzle スキーマ(7テーブル)と、Neon の RLS 非対応をアプリ層で代替する withOwner 所有者強制を実装。
### テスト
- vitest + pglite で 9 テスト green(所有者分離 SEC-001 / schema default / donations 冪等)。typecheck clean。
