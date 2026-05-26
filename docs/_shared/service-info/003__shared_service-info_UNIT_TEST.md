# _shared/service-info 単体テスト計画 (横断基盤)

> **入力**: `./001__shared_service-info_SPEC.md`, `./002__shared_service-info_PLAN.md`
> **最終更新**: 2026-05-27

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | collectMetrics | mock users 5件 | user_count=5 + status=ok + 最小スキーマ |
| U-N2 | GET /api/service-info | 正しいトークン | 200 + JSON (service/status/uptime/error_count/user_count/version) |
| U-N3 | error_count 集計 | エラーログ 3件 | error_count_24h=3 |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | GET /api/service-info | トークン不一致 | 401/403、ボディに集計値を返さない (SEC-004) |
| U-E2 | GET /api/service-info | レート超過 | 429 |
| U-E3 | collectMetrics | DB/Sentry 集計失敗 | status=degraded + 取得可能分のみ、PII 非ログ (SEC-002) |

### 1.3 境界値 / 規約 (PII 非混入が最重点)
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-P1 | レスポンス JSON | 全フィールド検査 | **メール/品目名/保管場所等の PII が一切含まれない** (集計値のみ、O48/SEC-002) |
| U-B1 | user_count | 0件 | user_count=0 で正常 |

## 2. Mock 方針

| 対象 | 方針 | 理由 |
|---|---|---|
| DB | mock / pglite | users 件数集計 |
| Sentry/ログ | mock | error_count 集計 |
| トークン | 固定値 | 認可テスト |
| レート制限 | カウンタ mock | 429 テスト |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行カバレッジ | 80% | concept 継承 |
| 分岐カバレッジ | 70% | concept 継承 |
| **PII 非混入** | **必須** | O48 / SEC-002、レスポンスに PII が無いことを必ず検証 |
| **認可スコープ** | 必須 | SEC-004、トークン/レート制限 |

## 4. 既存ユーティリティ依存
- `_shared/db` (users 件数集計、読み取りのみ)。

## 5. テスト実行環境
- フレームワーク: vitest
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (PII 非混入 + 認可スコープを重点検証) | /flow:feature |
