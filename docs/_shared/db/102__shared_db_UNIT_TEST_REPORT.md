# 単体テストレポート: _shared/db

## 実施日時
2026-05-27 (JST)

## 関連ドキュメント
- [003__shared_db_UNIT_TEST.md] - 単体テスト計画

## テスト実行環境
- Node.js: v22.11.0
- vitest: 2.1.9
- DB: @electric-sql/pglite 0.2.17 (in-memory Postgres、no-key・Class A)。生成 SQL を適用して実制約を検証

## テスト結果

| # | テストケース | テストファイル | 結果 | 備考 |
|---|---|---|---|---|
| U-N1 | item default (quantity=1, freshness_type=expiry) | src/db/owner.test.ts | ✅ | |
| U-N3/N4 | insert で user_id 付与、findMany は本人のみ | 同 | ✅ | 所有者分離 |
| U-N5 | findById 本人の id で取得 | 同 | ✅ | |
| U-E1 | 他人の id を findById → null | 同 | ✅ | **IDOR 防止 (SEC-001)** |
| U-E2 | 他人の行 update → null、本人は更新可 | 同 | ✅ | **SEC-001** |
| U-E3 | 他人の行 remove → false、本人は true | 同 | ✅ | **SEC-001** |
| U-B4 | userId 空文字は拒否 | 同 | ✅ | |
| U-N6 | donations user_id=null でゲスト投げ銭記録 | 同 | ✅ | D-028 |
| U-N7 | 同一 stripe_payment_id 二重記録 UNIQUE 拒否 | 同 | ✅ | 冪等 |

## 追加テストケース
追加テストケースなし(計画の正常系/異常系/境界を 9 ケースでカバー)。

## サマリー
| 項目 | 値 |
|---|---|
| 計画テスト数 | 9 |
| 追加テスト数 | 0 |
| 合計 | 9 |
| 成功 | 9 |
| 失敗 | 0 |
| 成功率 | 100% |

> 所有者分離 (SEC-001) は計画の「100% カバー」目標どおり find/update/delete/findById の全経路で他人アクセス拒否を検証。notification_settings 等の他 user-scoped テーブルは各機能実装時にカバー。
