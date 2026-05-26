# inspection 単体テスト計画

> **入力**: `./001_inspection_SPEC.md`, `./002_inspection_PLAN.md`
> **最終更新**: 2026-05-27

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | dueItems | lead_days=14, 期限10日後の item | 抽出される |
| U-N2 | dueItems | 期限60日後 | 抽出されない |
| U-N3 | dueItems | replace_guide 交換目安超過 | 抽出される |
| U-N4 | dueItems | check_only | 抽出されない (期限通知対象外) |
| U-N5 | cron expiry-check | 複数ユーザー | 各ユーザーの due を notification トリガー(mock) |
| U-N6 | POST inspection/log | summary | inspection_log 記録 (withOwner) |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | cron | Cron シークレット不一致 | 401 (INS-E1) |
| U-E2 | inspection log/logs | 他人の userId | withOwner で 0行/404 (SEC-001) |
| U-E3 | cron 通知失敗 | 1ユーザーで送信失敗 | failed 記録し他ユーザー処理継続 (INS-E3) |

### 1.3 境界値
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-B1 | dueItems | 期限=ちょうど lead_days | 抽出 (境界含む) |
| U-B2 | 点検 | items 0件 | EmptyState (INS-E4) |

## 2. Mock 方針
| 対象 | 方針 | 理由 |
|---|---|---|
| DB | pglite or mock | dueItems / inspection_log / withOwner |
| notification | mock sender | cron トリガー検証 (no-key) |
| 時刻 | 固定値注入 | 期限抽出の再現性 |
| Cron シークレット | 固定値 | 認可テスト |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 80% | concept 継承 |
| 分岐 | 70% | concept 継承 |
| dueItems 抽出 | freshness 3種 × 境界網羅 | 期限通知の中核 |
| 所有者分離 (SEC-001) | 必須 | inspection_log |

## 4. 既存ユーティリティ依存
- inventory(freshness)、db(inspection_log/items/withOwner)、notification(sender)。

## 5. テスト実行環境
- フレームワーク: vitest (+ testing-library for UI)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (dueItems 抽出 + cron 認可 + 所有者分離) | /flow:feature |
