# shopping-list 単体テスト計画

> **入力**: `./001_shopping-list_SPEC.md`, `./002_shopping-list_PLAN.md`
> **最終更新**: 2026-05-27

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | generate | 期限切れ2/不足1 items | shopping_item 3件 (reason 付き) |
| U-N2 | POST /api/shopping | 手動 name+manual | 1件追加 (withOwner) |
| U-N3 | PATCH is_bought | 自分の item | is_bought=true + bought_at |
| U-N4 | csvExport | name 一覧 | 正しい CSV |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | PATCH/DELETE | 他人の id | 404 (withOwner、SEC-001) |
| U-E2 | 未認証 | API | 401 |
| U-E3 | generate | items 0件 | 空リスト/「対象なし」(SL-E3) |

### 1.3 境界値 / CSV インジェクション (SEC-003、重点)
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-P1 | csvExport | name=`=cmd()` | エスケープ (`'=cmd()` 等、数式実行されない) |
| U-P2 | csvExport | name=`+`/`-`/`@` 始まり | 同様にエスケープ |
| U-P3 | csvExport | カンマ/改行/引用符を含む name | 正しくクオート |
| U-B1 | name | Unicode/絵文字 | 正常 |

## 2. Mock 方針
| 対象 | 方針 | 理由 |
|---|---|---|
| DB | pglite or mock | shopping_item / withOwner |
| auth | mock userId | 認可 |
| inventory(freshness) | 実ロジック or mock items | 生成抽出 |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 80% | concept 継承 |
| 分岐 | 70% | concept 継承 |
| **CSV インジェクション (SEC-003)** | **必須** | `=`/`+`/`-`/`@` + クオート網羅 |
| 所有者分離 (SEC-001) | 必須 | shopping_item |

## 4. 既存ユーティリティ依存
- inventory(freshness)、db(shopping_item/withOwner)。

## 5. テスト実行環境
- フレームワーク: vitest (+ testing-library for UI)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (CSV インジェクション + 所有者分離重点) | /flow:feature |
