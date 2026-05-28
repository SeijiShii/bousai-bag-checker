# _shared/service-info 単体テスト計画 (O48 ServiceHUB 2026-05-28 契約改訂への retrofit)

> **入力**: `./001_REVISE_SPEC.md`, `./002_REVISE_PLAN.md`, 既存 `src/services/serviceInfo/handler.test.ts` + `api/service-info.test.ts`
> **最終更新**: 2026-05-28

---

## 1. 追加テストケース

### 1.1 正常系

| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-NEW-1 | `collectMetrics` 新 shape | users 表に 5 件、3 件が直近 30 日 updated、error_count_24h=2 | `{schemaVersion:1, service:"bousai-bag-checker", status:"ok", metrics:[{key:"mau",value:3,unit:"users"},{key:"users_total",value:5,unit:"users"},{key:"error_count_24h",value:2,unit:"errors"}], version:"0.0.0", extra:{generated_at:<ISO>}}` |
| U-NEW-2 | `handleServiceInfo` 新 path | 正しい `HUB_SERVICE_INFO_SECRET` で GET | status=200、body は U-NEW-1 と同形式 |
| U-NEW-3 | 旧 endpoint 410 stub | `GET /api/service-info` (旧 URL) | status=410、body=`{error:"deprecated", moved_to:"/api/hub/service-info"}` |
| U-NEW-4 | MAU 算出 SQL | users に `updated_at` 31 日前 1 件、29 日前 2 件 | mau=2 (>30 日前は除外) |

### 1.2 異常系

| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-NEW-5 | env 未設定 | `HUB_SERVICE_INFO_SECRET=""` | 503 `{error:"service-info disabled"}` (fail-closed 維持) |
| U-NEW-6 | token 不一致 | 誤った Bearer | 401 `{error:"unauthorized"}` |
| U-NEW-7 | rate limit | 61 req/min | 61 回目で 429 |
| U-NEW-8 | DB 到達不可 | db.select throw | status=degraded、metrics は取得可能分のみ (error_count_24h は MetricsSource 経由で取れれば返す) |

### 1.3 境界値

| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-NEW-9 | MAU = 0 | users 0 件 | `mau:0`, `users_total:0`, status:ok (DB は到達できているため) |
| U-NEW-10 | 30 日境界 | updated_at が **ちょうど 30 日前** | 含む or 含まない (実装の `>` vs `>=` を SPEC 通り `> now() - interval '30 days'` で実装 = 30 日前は含まない) |

## 2. 修正テストケース

| ID | 対象 | 修正前 | 修正後 | 理由 |
|---|---|---|---|---|
| U-MOD-1 | `handler.test.ts` の正常系 | 旧 `ServiceInfo` (flat user_count/error_count_24h/generated_at) を assert | 新 `ServiceInfoResponse` (schemaVersion + metrics[] + extra) を assert | response shape 変更 |
| U-MOD-2 | `handler.test.ts` の token 検証 | env 名 `SERVICE_INFO_TOKEN` をコメントに記載 | `HUB_SERVICE_INFO_SECRET` に更新 | env rename |
| U-MOD-3 | `api/service-info.test.ts` (旧) → `api/hub/service-info.test.ts` (新) | endpoint path = `/api/service-info` | `/api/hub/service-info` | endpoint 移動 |
| U-MOD-4 | env 未設定の fail-closed テスト | `SERVICE_INFO_TOKEN` 未設定 | `HUB_SERVICE_INFO_SECRET` 未設定 | env rename |

## 3. 削除テストケース

| ID | 対象 | 削除理由 |
|---|---|---|
| U-DEL-1 | (なし) | rename + shape 変更のみ、旧テストの全削除はせず U-MOD で対応 |

## 4. リグレッション強化

- 既存 145 unit 全件 green を継続維持 (i18n / inventory / inspection 等の他機能テストは無関係、影響なし)
- 新 grep ガード: `git grep -nE "SERVICE_INFO_TOKEN|api/service-info[^.]" src/ api/ | wc -l` が **0** (旧 stub `api/service-info.ts` の 410 deprecation 内 string 文言は許容、ただしロジック識別子は残さない)

## 5. Mock 方針差分

| 対象 | 前回 | 今回 | 理由 |
|---|---|---|---|
| MetricsSource | inline mock (errorCount24h) | 同左、変更なし | 抽象は維持 |
| db | drizzle in-memory mock or pg-mem | 同左、`updated_at` を持つ users seed を追加 | MAU 算出のため `updated_at` 制御が必要 |

## 6. カバレッジ目標

| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 80% | 既存継承 |
| 分岐 | 70% | 既存継承 |

## 7. 更新履歴

| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 | /flow:revise |
