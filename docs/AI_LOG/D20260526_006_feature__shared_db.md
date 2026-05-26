# AI_LOG セッション D20260526_006 — /flow:feature _shared/db

**実行日時**: 2026-05-26 20:28 〜 20:32 (+09:00)
**コマンド**: /flow:feature _shared/db
**対象**: _shared/db (横断基盤、cross-cutting)
**実行者**: Claude (Opus 4.7) + seiji
**状態**: 完了 (SPEC/PLAN/UNIT_TEST。E2E は cross-cutting でスキップ)
**含まれる decision**: D20260526-029 〜 D20260526-031
**起動元**: /flow:auto (D20260526_002, 反復 4, P4 Phase 2)
**備考**: SPEC 生成中にユーザー割込 (D-028 投げ銭) → billing→donations / user.plan 廃止を SPEC に反映してから PLAN/UNIT を生成

---

## 主要決定サマリ
- D-029: 機能性質タグ = cross-cutting, auth-required (所有者分離 SEC-001)
- D-030: スキーマ確定 (7 テーブル: users/items/notification_settings/inspection_logs/donations/shopping_items/feedback)。投げ銭(D-028)で billing→donations、user.plan 廃止を反映。論点-001 は items.freshness_type で案A/B 両対応 (確定は inventory)
- D-031: withOwner(userId) を SEC-001 の唯一の所有者強制窓口に。user-scoped 4 テーブルは withOwner 経由必須、donations/feedback は user_id nullable で対象外

## 生成・更新したアーティファクト
- 新規: `001__shared_db_SPEC.md` / `002__shared_db_PLAN.md` / `003__shared_db_UNIT_TEST.md`
- 更新: `_shared/db/INDEX.md` (ファイル一覧/タグ) / `docs/INDEX.md` (db=設計済✅)
- E2E (004): cross-cutting のためスキップ (統合テストは機能側 E2E でカバー)

## 整合性チェック
- §3 NFR (CRUD<300ms) と矛盾なし。§1.4 src/db 構成に整合。SEC-001/SEC-002 を schema/owner に反映。投げ銭(D-028)整合済。

---

## decisions

### D20260526-029
- question: _shared/db の機能性質タグ
- chosen: cross-cutting, auth-required (所有者分離)
- chosen_type: auto-recommended
- context: 横断基盤・UI なし・全機能から呼ばれる。SEC-001 所有者強制を担うため auth-required

### D20260526-030
- question: DB スキーマ確定 (テーブル/カラム/enum/index)
- chosen: 7 テーブル (users/items/notification_settings/inspection_logs/donations/shopping_items/feedback)。items に freshness_type(enum) + nullable 期限/交換目安 (論点-001 案A/B 両対応)。index: user_id 系 + (user_id, expires_at)
- chosen_type: auto-recommended
- context: concept §5.1 を確定スキーマ化。D-028 投げ銭で billing→donations(user_id nullable)、user.plan 廃止。論点-001 最終確定は inventory 設計時(担当 seiji、論点-S-db-1)
- depends_on: [D20260526-028]

### D20260526-031
- question: 所有者分離 (SEC-001) の実装方式
- chosen: withOwner(userId) を唯一の所有者強制窓口に。user-scoped 4 テーブル (items/notification_settings/inspection_logs/shopping_items) は withOwner 経由必須、findById/update/delete は id+user_id 複合条件で IDOR 防止。donations/feedback は nullable で対象外
- chosen_type: auto-recommended
- context: Neon は RLS 非対応 → アプリ層強制。concept §3.1 SEC-001。UNIT_TEST で所有者分離を 100% カバー
- depends_on: [D20260526-018 (SEC-001), D20260526-030]
