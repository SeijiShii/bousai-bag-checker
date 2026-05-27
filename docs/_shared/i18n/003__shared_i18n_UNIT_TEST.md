# _shared/i18n 単体テスト計画

> **入力**: `./001__shared_i18n_SPEC.md`, `./002__shared_i18n_PLAN.md`
> **最終更新**: 2026-05-27

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | 検出: localStorage 優先 | `bousai.locale=ko` + navigator=en | ロケール=ko |
| U-N2 | 検出: navigator フォールバック | localStorage 空 + navigator=`zh-CN` | ロケール=zh-Hans (正規化) |
| U-N3 | 検出: ja デフォルト | localStorage 空 + navigator=`fr` | ロケール=ja |
| U-N4 | t() 各ロケール | `t('nav.inventory')` を ja/en/zh/ko で | 各ロケールの訳 (品目/Items/物品/품목 等) |
| U-N5 | setLocale 永続 | `setLocale('en')` | localStorage `bousai.locale=en` + i18n.language=en + `<html lang>`=en |
| U-N6 | formatDate | (date, 'en') / (date, 'ja') | ロケール別の日付表記 |
| U-N7 | categoryLabel | `categoryLabel('water', t)` ja | 「水」(enum 生値でない) |
| U-N8 | 承認済み校正反映 | `t('inventory.form.category')` ja / `t('status.fresh')` ja | 「種類」/「問題なし」 |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | キー欠落 | 存在しないキー `t('foo.bar')` | ja フォールバック試行 → 無ければキー名 (prod では画面に出さない設計) |
| U-E2 | ロケール未対応 | `setLocale('fr')` | 無視 or ja に丸め (4 言語のみ受理) |

### 1.3 境界値 / 網羅
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-B1 | **キー集合一致** | ja.json のキー集合 vs en/zh-Hans/ko.json | **4 ロケールが完全に同一キー集合** (欠落・余剰ゼロ)。これが i18n の品質ゲート |
| U-B2 | 補間 | `t('...', {count})` | プレースホルダが値で置換 |

## 2. Mock 方針
| 対象 | 方針 | 理由 |
|---|---|---|
| localStorage | jsdom 標準 or stub | 永続検証 |
| navigator.language | テストで上書き (Object.defineProperty) | 検出分岐 |
| i18n instance | 実物 (config.ts) | 結合で検証 |
| `<html>` | jsdom document | lang 同期検証 |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 80% | 継承 |
| 分岐 | 70% | 検出/正規化分岐を網羅 |

## 4. 既存ユーティリティ依存
- enums.ts (ITEM_CATEGORIES/FRESHNESS_TYPES) を labels.ts が参照。
- テストは `src/i18n/*.test.ts` + コンポーネント t() 化の回帰は各 `*.test.tsx`。

## 5. テスト実行環境
- フレームワーク: vitest (.ts=node, .tsx=jsdom)。
- **キー集合一致テスト (U-B1) を必須化** (4 ロケール JSON を読み比較)。

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 | /flow:feature |
