# _shared/service-info 変更計画書 (O48 endpoint 配線)

> **入力**: `./001_REVISE_SPEC.md`, 既存実装 (`src/services/serviceInfo/*`, `api/_lib/handler.ts`, `src/db/client.ts`, `src/services/ratelimit/*`), concept §1.4
> **最終更新**: 2026-05-27

---

## 1. 既存ファイル変更一覧
| ファイル | 変更内容 | リスク | 関連 SPEC § |
|---|---|---|---|
| (なし — 既存 handler/collectMetrics は無変更で再利用) | — | — | §1 |

## 2. 新規ファイル一覧
| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `api/service-info.ts` | Vercel Function。token 抽出 + deps 組立 (getDb/collectMetrics/InMemoryRateLimiter/SERVICE_INFO_TOKEN) + `handleServiceInfo` 呼出 + 405/503 ガード。`serviceInfoRoute`/`extractToken` を test 用に export | `src/services/serviceInfo`, `src/db/client`, `src/services/ratelimit`, `./_lib/handler` | ~45 |
| `api/service-info.test.ts` | 配線スモーク (deps 注入で token 抽出 / 200 / 401 / 405 / 503 を検証) | 上記 + `@/db/test-helpers` | ~60 |

## 3. 削除ファイル一覧
| ファイル | 削除理由 | 代替 |
|---|---|---|
| (なし) | — | — |

## 4. マイグレーション要否
- DB スキーマ変更: ❌ / 既存データ変換: ❌ / 設定変更: ✅ (`SERVICE_INFO_TOKEN` を env に設定、release 工程) / ストレージ: ❌

## 5. 実装 Phase 分割
### Phase 1 (RED→GREEN→IMPROVE)
- 対象: `api/service-info.ts` + `api/service-info.test.ts`
- ゴール: token をヘッダから抽出し、deps を組み立てて `handleServiceInfo` に委譲。405/503 ガード。スモーク green + typecheck clean。
- 既存 7 unit (core) は無変更で維持。

## 6. 依存関係順序
```
handleServiceInfo (既存) ──┐
collectMetrics (既存) ─────┼─→ api/service-info.ts (新規 wiring) ─→ smoke test
InMemoryRateLimiter (既存)─┘
```

## 7. ロールアウト計画
| ステップ | 内容 | 期日 | 検証 |
|---|---|---|---|
| 1 | endpoint 実装 + スモーク green | 2026-05-27 | vitest + typecheck |
| 2 | `SERVICE_INFO_TOKEN` を env 設定 | release P4.7 | デプロイ後 `GET /api/service-info` 疎通 (O51) |

## 8. リスク・注意点
- token 未設定で 503 を返す fail-closed を必ず実装 (誤って集計値を全開放しない)。
- error metrics は Sentry 未配線で `degraded` 固定 → release の Sentry 配線で解消 (本改修スコープ外、SPEC §7.4 に明記)。

## 9. 完了の定義 (DoD)
- [x] `api/service-info.ts` 実装、`export default` が api/ 規約準拠
- [x] スモークテスト green (token 抽出 / 200 / 401 / 405 / 503)
- [x] 既存 7 unit 維持 + typecheck clean
- [x] `api/` から `handleServiceInfo` が import される (grep で確認)

## 10. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 | /flow:revise |
