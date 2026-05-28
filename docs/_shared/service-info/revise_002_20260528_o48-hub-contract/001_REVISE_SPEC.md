# _shared/service-info 変更仕様書 (O48 ServiceHUB 2026-05-28 契約改訂への retrofit)

> **改修種別**: 機能変更 (連携契約の改訂追従)
> **issue / slug**: 002 / o48-hub-contract-2026-05-28
> **基準 SPEC**: `../001__shared_service-info_SPEC.md`
> **最終更新**: 2026-05-28
> **タグ**: stateful (DB read), auth-required (shared secret), backend-only

---

## 1. 変更概要

ServiceHUB が 2026-05-28 に確定した契約改訂 ([D20260528-001/002]、perspectives.md O48 反映済) に追従。**(1) 全サービス共通シークレットへ統一**、**(2) endpoint path 変更**、**(3) response schema 変更 + MAU 自己申告**。本 PJ は ServiceHUB 第一弾サービスのため、契約 SoT (perspectives.md O48) に厳密追従する。

## 2. 変更前 vs 変更後

### 2.1 UC 変更
| UC ID | 変更前 | 変更後 | 理由 |
|---|---|---|---|
| UC1 (HUB が service-info を pull する) | endpoint = `/api/service-info`、shared secret = `SERVICE_INFO_TOKEN` (per-service) | endpoint = `/api/hub/service-info`、shared secret = `HUB_SERVICE_INFO_SECRET` (共通) | [D20260528-002] 秘密ゼロ化、per-service secret 廃止 |

### 2.2 入出力変更

#### endpoint path

| | 変更前 | 変更後 | 互換性 |
|---|---|---|---|
| URL | `GET /api/service-info` | `GET /api/hub/service-info` | **非互換 (一括)**。旧 URL は廃止し 410 Gone or 404 を返す (HUB は新契約を pull、混乱回避のため fail-fast) |
| auth header | `Authorization: Bearer <SERVICE_INFO_TOKEN>` または `X-Service-Info-Token: <...>` | `Authorization: Bearer <HUB_SERVICE_INFO_SECRET>` または `X-Service-Info-Token: <...>` (header 名は維持、value だけ新 secret) | **非互換 (一括)**。env 名 + value が変わる |

#### response body

変更前 (旧 ServiceInfo):
```json
{
  "service": "bousai-bag-checker",
  "status": "ok" | "degraded",
  "user_count": 0,
  "error_count_24h": 0,
  "version": "0.0.0",
  "generated_at": "ISO-8601"
}
```

変更後 (新 ServiceInfoResponse、案A=最小固定+extra):
```json
{
  "schemaVersion": 1,
  "service": "bousai-bag-checker",
  "status": "ok" | "degraded" | "down",
  "metrics": [
    { "key": "mau", "value": <number>, "unit": "users" },
    { "key": "users_total", "value": <number>, "unit": "users" },
    { "key": "error_count_24h", "value": <number>, "unit": "errors" }
  ],
  "version": "0.0.0",
  "extra": {
    "generated_at": "ISO-8601"
  }
}
```

| フィールド | 変更前 | 変更後 | 互換性 |
|---|---|---|---|
| `schemaVersion` | (無し) | `1` (number、必須) | 新規 |
| `service` | `"bousai-bag-checker"` (string) | 同左 | 維持 |
| `status` | `"ok" \| "degraded"` | `"ok" \| "degraded" \| "down"` に拡張 | 拡張 (互換) |
| `user_count` | flat | `metrics[]` で `key="users_total"` に移動 | **非互換** (flat フィールド廃止) |
| `error_count_24h` | flat | `metrics[]` で `key="error_count_24h"` に移動 | **非互換** |
| **`mau`** (新規) | (無し) | `metrics[] {key:"mau", value, unit:"users"}` 必須 | 新規必須 |
| `version` | flat | 同左 (optional) | 維持 |
| `generated_at` | flat | `extra.generated_at` に移動 | 非互換 (extra へ) |

### 2.3 データモデル変更
| エンティティ | 変更内容 | マイグレーション要否 |
|---|---|---|
| users | スキーマ変更なし。`updatedAt` を MAU 算出 (= 直近 30 日に updated_at が更新された unique user 数) に使う。`updatedAt` カラムは既存で `defaultNow()` + Drizzle の `$onUpdate` 等で自動更新される想定 (現在は明示的 update がないため、別途 touch 戦略を検討、§9 論点-001) | 不要 (既存カラム流用) |

### 2.4 バリデーション・エラー変更
| 対象 | 変更前 | 変更後 |
|---|---|---|
| token 検証 | env 未設定なら 503 (fail-closed) | 同左 (env 名のみ変更) |
| token 不一致 | 401 unauthorized | 同左 |
| rate limit | 429 rate_limited | 同左 |
| 旧 URL `/api/service-info` | 200 (現契約として動作) | **410 Gone** or **404** (廃止明示。HUB は新 URL のみ pull) |

## 3. 影響範囲

| 対象 | 影響度 | 説明 |
|---|---|---|
| `_shared/service-info` (本機能) | 高 | 直接対象 (endpoint 移設 + response 変更 + secret 名変更) |
| `.env.example` / `.env.local` | 高 | env 名 `SERVICE_INFO_TOKEN` → `HUB_SERVICE_INFO_SECRET` リネーム |
| service-hub PJ | 中 | 既に新契約で実装済 ([D20260528-001/002] 確定後)、本 PJ 追従待ち |
| 他機能 | 低 | service-info を import している他機能無し (独立) |

## 4. 後方互換性

- **互換維持**: ❌ **一括非互換**
- 影響を受けるクライアント: **ServiceHUB のみ** (本 endpoint は HUB 専用、一般公開しない)
- 移行期間: 不要 (HUB 側は既に新契約で実装済、本 PJ 追従で同期完了)
- 旧 endpoint `/api/service-info`: **廃止** (410 Gone を返してクライアント側の混乱を防ぐ)
- 旧 env `SERVICE_INFO_TOKEN`: 廃止 (deploy-target env からも削除)

理由: 連携先が単一 (HUB のみ) + HUB 側は既に新契約 → 互換層を残す価値が無く、混乱回避のため fail-fast。

## 5. ロールバック方針

- **コード revert で戻せる**: ✅ (DB 変更なし、env rename のみ)
- **DB マイグレーション**: なし (`users.updatedAt` 既存カラム流用)
- **手順**:
  1. `git revert <commit>` で endpoint + response + env を旧契約へ戻す
  2. deploy-target env で `HUB_SERVICE_INFO_SECRET` を旧 `SERVICE_INFO_TOKEN` に rename
  3. HUB 側の registry を旧 URL に戻す (seiji 操作)

## 6. リリース戦略

- **方式**: **一括** (連携先が HUB のみで、両側を同時更新)
- **ロールアウト計画**:
  1. 本 PJ で revise 実装 (本 revise 完了 → /flow:tdd で実装)
  2. ローカルテスト green
  3. deploy-target env で `HUB_SERVICE_INFO_SECRET` を設定 (release Phase 1)
  4. デプロイ (release Phase 3)
  5. HUB 側 registry で本サービスの endpoint を新 URL に更新 (seiji の admin 操作、HUB 側で完結)
- フィーチャーフラグ: 不要 (連携先単一、可逆性は git revert で十分)

## 7. 詳細仕様 (新仕様)

### 7.1 詳細 UC (新仕様)

**UC1**: HUB が `/api/hub/service-info` を `Authorization: Bearer <HUB_SERVICE_INFO_SECRET>` で GET し、本サービスのアプリ層指標 (MAU 含む) を取得する。pull のみ、サービス側からの push は無し。

### 7.2 入出力 (新仕様)

`GET /api/hub/service-info`:
- 認証成功 (200): 上記 §2.2 response 形式
- 認証不一致 (401): `{ "error": "unauthorized" }`
- レート超過 (429): `{ "error": "rate_limited" }`
- env 未設定 (503): `{ "error": "service-info disabled" }`
- method 不一致 (405): `{ "error": "Method Not Allowed" }`

旧 URL `GET /api/service-info`:
- 410 Gone: `{ "error": "deprecated", "moved_to": "/api/hub/service-info" }`

### 7.3 データモデル (新仕様)

- `users` テーブル: 既存スキーマ流用
  - `users_total`: `SELECT count(*) FROM users`
  - `mau`: `SELECT count(DISTINCT id) FROM users WHERE updated_at > now() - interval '30 days'`
  - 既存実装で `users.updatedAt` が **登録時 = createdAt = updatedAt**、以降 user 操作で `updated_at` を touch するロジックが必要 (§9 [論点-001])
- error_count_24h: 既存 `MetricsSource` 流用 (Sentry/自前ログ取得不可なら status=degraded)

### 7.4 バリデーション・エラー (新仕様)

§2.4 表のとおり。token 検証 + rate limit + fail-closed (env 未設定) は既存維持。

### 7.5 機能固有 NFR + 連携 (新仕様)

- 認可: `HUB_SERVICE_INFO_SECRET` 不一致は **集計値も返さない** (SEC-004 維持)
- PII 非混入: response は集計値のみ (個別 user_id / clerk_user_id を出さない、SEC-002 維持)
- rate limit: 既存 IP 60 req/min 流用
- contract drift 再発防止: `HUB_SERVICE_INFO_SECRET` + `/api/hub/service-info` の 2 signals を perspectives.md O48 `required_signals` に明示済 (CF-20260528-010)

## 8. タグ別追加項目

### auth-required (shared secret)
- env 不在で 503 fail-closed 維持
- secret rotation: HUB 側 admin で新 secret を発行 → 各サービスの deploy-target env に手動反映 (HUB 側 admin が seiji なので運用負担小)

### stateful (DB read)
- DB 未到達でも error_count を MetricsSource から取れれば部分応答 (status=degraded)

### backend-only (Vercel Function)
- ESM import の拡張子問題 (O51) は既存実装で対処済 (build OK)

## 9. 未決事項

### [論点-001] MAU 算出のための updated_at touch 戦略
- **status**: `解決済` (2026-05-28、案 A 同等を**既存実装で達成**)
- **影響範囲**: §7.3 データモデル、`users` テーブル更新タイミング
- **解決の経緯**: tdd 実装中に `src/services/auth/makeAuth.ts:getOrCreateUser` が既に `onConflictDoUpdate({ set: { updatedAt: new Date() }})` で **認証通過のたびに `users.updated_at` を touch する upsert** を実装済と判明。`requireUser` → `getAuthUserId` → `getOrCreateUser` の経路で全 API request で touch が走る = 案 A (auth middleware touch) と同等のロジックが既に完結している。
- **採用案**: **案 A 同等 (既存 `getOrCreateUser` upsert で達成、追加実装不要)**
- **判断期限**: 本 revise の /flow:tdd 着手時 → ✅ 達成 (2026-05-28)
- **担当**: seiji

## 10. 更新履歴

| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 (O48 2026-05-28 契約改訂への retrofit、CF-20260528-010 経由) | /flow:revise |
