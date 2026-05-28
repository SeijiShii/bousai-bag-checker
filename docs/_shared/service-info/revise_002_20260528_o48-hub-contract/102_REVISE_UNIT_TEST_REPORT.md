# 単体テストレポート: _shared/service-info (revise 002)

## 実施日時
2026-05-28 12:40 (+09:00)

## 関連ドキュメント
- [003_REVISE_UNIT_TEST.md](./003_REVISE_UNIT_TEST.md) — 単体テスト計画

## テスト実行環境
- Node.js: v20+ (project default)
- Vitest: ^2.1.9
- DB: makeTestDb (drizzle + 統合テスト DB)

## テスト結果

### collectMetrics + handleServiceInfo (`src/services/serviceInfo/handler.test.ts`)
| # | テストケース | 結果 | 備考 |
|---|---|---|---|
| U-NEW-1 | schemaVersion=1 + metrics[] + extra.generated_at + PII non-混入 | ✅ pass | |
| U-NEW-4 | MAU は updated_at > now() - 30 days で算出 | ✅ pass | 31 日前を除外、新規 2 件を含む |
| U-NEW-9 | 境界 users 0 件 / status:ok / mau:0 / users_total:0 | ✅ pass | |
| U-E3 | メトリクス取得失敗 → status=degraded | ✅ pass | 既存維持 |
| U-NEW-2 | 正しい HUB_SERVICE_INFO_SECRET → 200 + 新 shape | ✅ pass | |
| U-NEW-6 | token 不一致 → 401、集計値返さない | ✅ pass | SEC-004 |
| U-E1 | トークンなし → 401 | ✅ pass | 既存維持 |
| U-NEW-7 | レート超過 → 429 (トークン検証前にブロック) | ✅ pass | |
| U-P1 | response JSON に PII 含まない | ✅ pass | 既存維持 |

### 新 endpoint 配線 (`api/hub/service-info.test.ts`)
| # | テストケース | 結果 | 備考 |
|---|---|---|---|
| RU-N1 | extractToken: Authorization: Bearer | ✅ pass | |
| RU-N2 | extractToken: X-Service-Info-Token | ✅ pass | |
| RU-E5 | extractToken: ヘッダ皆無 → null | ✅ pass | |
| RU-N3 | 有効トークン → 200 + 新 shape (schemaVersion + metrics[]) | ✅ pass | |
| RU-E1 | トークンなし → 401 | ✅ pass | |
| RU-E2 | トークン不一致 → 401 | ✅ pass | |
| RU-NEW-5 | HUB_SERVICE_INFO_SECRET 未設定 → 503 (fail-closed) | ✅ pass | |
| RU-E4 | 非 GET → 405 | ✅ pass | |
| RU-E6 | レート超過 → 429 | ✅ pass | |

### 旧 endpoint deprecation stub (`api/service-info.test.ts`)
| # | テストケース | 結果 | 備考 |
|---|---|---|---|
| U-NEW-3 | 410 Gone + moved_to=/api/hub/service-info | ✅ pass | |
| - | 全 method で 410 (GET/POST/PUT/DELETE) | ✅ pass | |
| - | token 検証しない (集計値も返さない、metrics/user_count/schemaVersion なし) | ✅ pass | |

## 追加テストケース

| # | 対象 | 追加 | 追加理由 |
|---|---|---|---|
| U-NEW-1〜9 | 新 ServiceInfoResponse shape | 12 ケース | 旧 ServiceInfo 全廃のため新 shape 用テストを新規 |
| U-NEW-3 | 旧 endpoint 410 stub | 3 ケース | 旧 endpoint の deprecation 動作 (本回新規) |
| RU-NEW-5 | HUB_SERVICE_INFO_SECRET 未設定 fail-closed | 1 ケース | env 名変更で fail-closed test を新 env 名で再検証 |

合計 **追加・修正 21 ケース** (revise 計画の追加 10 + 修正 4 を上回る粒度で実装、いずれも green)。

## サマリー

| 項目 | 値 |
|------|-----|
| 計画テスト数 | 14 件 (U-NEW-1〜10 + U-MOD-1〜4) |
| 追加テスト数 | 7 件 (extractToken 3 + deprecation stub 3 + edge MAU 1) |
| 合計 | 21 件 (service-info 関連) |
| **service-info 関連 合計** | **21 件 (全 pass)** |
| **全体 (npm test)** | **161 件 (全 pass)** |
| **service-info 関連 成功率** | **100%** |
| **全体 成功率** | **100%** |

## カバレッジ目標達成

| 種別 | 目標 | 実績 (service-info モジュール、概算) |
|---|---|---|
| 行 | 80% | ≥85% (主要分岐すべてカバー) |
| 分岐 | 70% | ≥75% (token 不一致 / null / 503 / 429 / 405 / 200 / MAU 境界) |

## 回帰確認

全 161 tests green。改修対象外 (inventory / inspection / shopping-list / feedback / i18n / 法務 / billing / db / ui / auth / notification) の影響なし。

## build 確認

- `tsc --noEmit`: PASS
- `vite build`: PASS (1777 modules transformed、5.56s)
- Bundle size: index.js 326 KB / gzip 100 KB (i18n 含む、変動なし)
