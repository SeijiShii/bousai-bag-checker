# inventory 単体テスト計画

> **入力**: `./001_inventory_SPEC.md`, `./002_inventory_PLAN.md`
> **最終更新**: 2026-05-27

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | freshness | expiry, 期限14日後, lead_days=14 | warn |
| U-N2 | freshness | expiry, 期限60日後 | fresh |
| U-N3 | freshness | expiry, 期限切れ | expired |
| U-N4 | freshness | replace_guide, 交換目安超過 | warn/expired |
| U-N5 | freshness | check_only | 期限判定なし(内容確認のみ) |
| U-N6 | itemRepository.create | name+category | withOwner で本人の item 作成 |
| U-N7 | GET /api/items | 認証済 | 本人の items のみ |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | findById/update/delete | 他人の id | null/0行 → 404 (IDOR、SEC-001) |
| U-E2 | API | 未認証 | 401 |
| U-E3 | itemSchema | name 空 / 201字 | 検証エラー |
| U-E4 | itemSchema | freshness=expiry + expires_at なし | 検証エラー |
| U-E5 | R2 アップロード | 失敗 | 5xx、保管場所/PII 非ログ (SEC-002) |

### 1.3 境界値
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-B1 | quantity | 0 / 負数 | 0 OK、負数は検証エラー |
| U-B2 | name | Unicode/絵文字 | 正常保存 |
| U-B3 | freshness | 期限=今日 (境界) | warn or expired (定義に従う) |

## 2. Mock 方針
| 対象 | 方針 | 理由 |
|---|---|---|
| DB | pglite or mock | withOwner / IDOR 検証 |
| auth (requireUser) | mock userId | 認可テスト |
| R2 | mock uploader | no-key、失敗系再現 |
| 時刻 (freshness) | 固定値注入 | 再現性 |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 80% | concept 継承 |
| 分岐 | 70% | concept 継承 |
| **所有者分離 (SEC-001)** | **100%** | IDOR 防止、find/update/delete 全て |
| freshness 算出 | 3種×3段階を網羅 | 論点-001 案A の中核ロジック |

## 4. 既存ユーティリティ依存
- db(items/withOwner)、auth(requireUser)、lib(date)。

## 5. テスト実行環境
- フレームワーク: vitest (+ @testing-library/react for UI)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (freshness 3種×3段階 + 所有者分離100%) | /flow:feature |
