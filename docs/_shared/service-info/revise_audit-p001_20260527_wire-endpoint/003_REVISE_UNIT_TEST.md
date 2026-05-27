# _shared/service-info 単体テスト計画 (O48 endpoint 配線)

> **入力**: `./001_REVISE_SPEC.md`, `./002_REVISE_PLAN.md`, 既存 `src/services/serviceInfo/handler.test.ts` (7 green)
> **最終更新**: 2026-05-27

---

## 1. 追加テストケース (配線スモーク、`api/service-info.test.ts`)

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| RU-N1 | extractToken | `Authorization: Bearer secret` | `'secret'` |
| RU-N2 | extractToken | `X-Service-Info-Token: secret` | `'secret'` |
| RU-N3 | serviceInfoRoute | GET + 有効トークン + token 設定済 deps | status 200、body に `service/status/user_count` (PII キーなし) |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| RU-E1 | serviceInfoRoute | トークンヘッダなし | status 401 `{error:'unauthorized'}` |
| RU-E2 | serviceInfoRoute | トークン不一致 | status 401 |
| RU-E3 | serviceInfoRoute | `expectedToken` 空 (`SERVICE_INFO_TOKEN` 未設定) | status 503 `{error:'service-info disabled'}` (fail-closed) |
| RU-E4 | serviceInfoRoute | POST メソッド | status 405 |
| RU-E5 | extractToken | ヘッダ皆無 | `null` |

## 2. 修正テストケース
| ID | 対象 | 修正前 | 修正後 | 理由 |
|---|---|---|---|---|
| (なし — 既存 7 unit は無変更) | — | — | — | — |

## 3. 削除テストケース
| ID | 対象 | 削除理由 |
|---|---|---|
| (なし) | — | — |

## 4. リグレッション強化
- 既存 `handler.test.ts` の 7 ケース (collectMetrics / 401 / 429 / 200 / PII 非混入) を維持。
- 配線層は core handler を mock せず実物に委譲し、deps (db=pglite test, rateLimiter=allowAll, token) を注入して結合を検証。

## 5. Mock 方針差分
| 対象 | 前回 | 今回 | 理由 |
|---|---|---|---|
| db | pglite (makeTestDb) | 同左 | 結合スモークも実 db で集計検証 |
| req/res | — | 構造的 mock (ApiReq/ApiRes) | Vercel Function I/F を no-dep で再現 |

## 6. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 (api/service-info.ts) | 100% | 薄い wiring、全分岐 (200/401/405/503) をスモークで網羅 |

## 7. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 | /flow:revise |
