# _shared/db 単体テスト計画 (横断基盤)

> **入力**: `./001__shared_db_SPEC.md`, `./002__shared_db_PLAN.md`
> **最終更新**: 2026-05-26

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | schema | items 行を insert | category/freshness_type enum・default(quantity=1, freshness_type='expiry')が効く |
| U-N2 | schema | notification_settings 既定 | email_enabled=false / inapp_enabled=true / lead_days=14 |
| U-N3 | withOwner(uid).items.insert | name/category | user_id=uid が自動付与され 1 行作成 |
| U-N4 | withOwner(uid).items.findMany | 同 uid の 3 行 | 3 行返る (他 uid の行は含まない) |
| U-N5 | withOwner(uid).items.findById(id) | 自分の id | 該当 1 行 |
| U-N6 | donations.insert (user_id=null) | ゲスト投げ銭 amount=100 | user_id null で記録される |
| U-N7 | donations.insert 同一 stripe_payment_id 2回 | 冪等 | UNIQUE 制約で 2 回目は重複エラー (webhook 冪等性) |

### 1.2 異常系 (SEC-001 所有者分離が中心)
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | withOwner(uidA).items.findById(uidB の item id) | 他人の id | **null を返す** (IDOR 防止、SEC-001) |
| U-E2 | withOwner(uidA).items.update(uidB の id, ...) | 他人の行更新 | **0 行更新** (拒否) |
| U-E3 | withOwner(uidA).items.delete(uidB の id) | 他人の行削除 | **0 行削除** (拒否) |
| U-E4 | items.insert with enum 範囲外 category | 'invalid' | DB 制約違反例外 (アプリ層 Zod で事前に弾く前提) |
| U-E5 | items.insert FK 違反 (存在しない user_id) | 不正 user_id | FK 違反例外 → 機能側で 400/404 にマップ |
| U-E6 | client 接続失敗 | DATABASE_URL 不正/到達不可 | 例外送出 (PII を含めない、SEC-002) |

### 1.3 境界値
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-B1 | items.name | 空文字 / 200字超 | アプリ層 Zod で弾く (DB は長さ無制限だが機能側で制限、論点-006) |
| U-B2 | quantity / lead_days / replace_months | 0 / 負数 | アプリ層 Zod で非負強制 |
| U-B3 | storage_location | Unicode / 絵文字含む | 正常保存 (UI 表示は別、保管場所は本人限定) |
| U-B4 | withOwner | userId=空文字/null | 例外 or 空結果 (auth が保証する前提だが防御的に弾く) |

## 2. Mock 方針

| 対象 | 方針 | 理由 |
|---|---|---|
| DB (Neon) | **pglite (in-memory Postgres)** で実スキーマ適用、or drizzle + テスト用接続 | enum/FK/UNIQUE 制約を実際に検証したいため実 Postgres 互換が望ましい。CI no-key (ローカル in-memory) |
| client | injectable (`createDb(connStr)`) | テストで pglite 接続を注入、実 Neon を呼ばない |
| 時刻 (created_at 等) | DB default now() / 必要なら固定注入 | 再現性 |
| Stripe payment id | 固定文字列 | 冪等性テスト (U-N7) |

> Neon 実接続を要するテストは行わない (no-key = Class A 維持)。pglite で Postgres 方言の制約を検証。

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行カバレッジ | 80% | concept §継承 |
| 分岐カバレッジ | 70% | concept §継承 |
| **withOwner の所有者分離** | **100%** | SEC-001 は cross-tenant 漏洩防止の要、全 user-scoped テーブルで分離ケース必須 |

## 4. 既存ユーティリティ依存
新規 PJ のため依存なし。本基盤が後続のテスト基礎を提供。

## 5. テスト実行環境
- フレームワーク: vitest (concept §4.3 想定スタック)
- DB: pglite (in-memory Postgres、no-key)
- 並列実行: テストごとに分離スキーマ or トランザクションロールバック
- 実行コマンド (例示): テストランナー実行 (`npm run test`)

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (所有者分離 SEC-001 を 100% カバー目標に) | /flow:feature |
