<!-- auto-generated-start -->
# 設計レビューレポート — _shared/i18n

**レビュー日**: 2026-05-27
**レビュー実施者**: Claude (Opus 4.7) + seiji
**対象**: _shared/i18n (多言語基盤 retrofit)
**入力**: docs/_shared/i18n/001-004 + concept §1.2/§1.3.2/§3/§9.2
**観点ソース**: 組み込みチェックリスト + 実コード Grep 調査
**モード**: auto-pick
**severity-threshold**: low

## 1. レビューサマリー

| 観点 | 評価 | 備考 |
|------|------|------|
| 仕様の明確性 | OK | IF/カタログ/Phase 明確 |
| 既存パターンとの一貫性 | OK | injectable/keyless bootstrap と整合 |
| **抽出インベントリ網羅性** | **要是正** | R1: 6 文字列の漏れ検出 |
| 接尾辞/区切りハードコード | 要是正 | R2: aria template 2 件 (CLAUDE.md 方針) |
| Zod エラーの i18n 化方式 | 要設計 | R3: itemSchema + feedbackSchema |
| 影響範囲・副作用 | OK | test 追従 ~11 file (R6) |
| main bootstrap 干渉 | OK | R5: 干渉なし |

## 2. 指摘事項 (severity 降順)

### [R1] 文字列抽出インベントリの漏れ (severity=High)
- **対象**: 001 SPEC §4
- **問題**: 実コード Grep で SPEC §4 が未収載の user-facing 文字列を 6 件検出:
  - `FeedbackWidget` 「不具合を報告」(bug 報告トグル)
  - `feedbackSchema` 「reaction が必要です」「内容を入力してください」(Zod message)
  - `ItemList` 「削除」(ボタン) + `${name}を削除` (aria)
  - `ShoppingList` 「CSV で書き出し」+ `${name}を購入済みにする` (aria)
- **推奨**: SPEC §4 に追記 (下記キー)。**反映済**。
- **種別**: 指摘事項 (自動反映)
- **chosen**: SPEC §4 に 7 キー追加 (feedback.bugReport / errors.feedbackReactionRequired / errors.feedbackContentRequired / inventory.delete / inventory.deleteAria / shopping.exportCsv / shopping.toggleBoughtAria)
- **反映先**: 001 SPEC §4

### [R2] 接尾辞/aria template は完全文の interpolation キーに (severity=Medium)
- **対象**: 001 SPEC §6 (i18n タグ)
- **問題**: `${name}を削除` / `${name}を購入済みにする` は固定接尾辞「を削除」をハードコードする形。en/ko/zh は語順が異なる (en: "Delete {{name}}") ため、接尾辞分割でなく**完全文を 1 キー**にし interpolation する必要 (CLAUDE.md i18n 方針)。
- **推奨**: `inventory.deleteAria` = "{{name}}を削除" / en "Delete {{name}}"、`shopping.toggleBoughtAria` = "{{name}}を購入済みにする" / en "Mark {{name}} as bought"。t('key', {name}) で呼ぶ。**反映済** (SPEC §6 に方針追記)。
- **chosen**: interpolation キー化 (固定接尾辞禁止)
- **反映先**: 001 SPEC §4 (キー) + §6 (方針)

### [R3] Zod スキーマのエラー i18n 化方式 (severity=Medium)
- **対象**: 001 SPEC §5.2、002 PLAN Phase 4
- **問題**: itemSchema + feedbackSchema の Zod `message` をどう翻訳するか。Zod を t() に依存させると純粋性/テスタビリティが落ちる。
- **推奨**: **Zod message に i18n キー文字列を格納** (例 `message: 'errors.nameRequired'`)、表示層 (Field error 表示 / FeedbackWidget) で `t(issue.message)` する。Zod スキーマは t に非依存のまま (テストは key を assert)。**反映済**。
- **chosen**: Zod=キー格納 / 表示層=t() 翻訳 (関心分離、テスタビリティ維持)
- **反映先**: 001 SPEC §5.2 + 003 UNIT_TEST (Zod は key を返す前提)

### [R4] SettingsScreen の「100円」分割文を 1 キーに統合 (severity=Low)
- **対象**: 001 SPEC §4 (settings.supportBody/tip)
- **問題**: 現 JSX で "100" が文中で分割 (61-62 行)。i18n キーは分割せず 1 文に (金額 100 は定数のため固定文でよい、または {{amount}} 補間)。
- **推奨**: `settings.supportBody` を 1 文に統合 (100 は固定文)。**反映済** (SPEC §4 既に 1 文)。
- **chosen**: 1 キー = 1 完全文 (分割禁止)

### [R5] main.tsx i18n init 配線 (severity=Info)
- **問題**: i18n init を main.tsx で render 前に import するか。
- **chosen**: `src/i18n/config.ts` を main.tsx で import (i18next は global init、Provider 任意)。BackendProvider と独立、keyless bootstrap に干渉なし。`#root が見つかりません` の throw は developer-facing のため t() 対象外。
- **反映先**: 002 PLAN Phase 3 (既に main.tsx 配線を記載)

### [R6] テスト追従範囲 (severity=Info)
- **問題**: JP 文字列を assert する test は ~11 file。
- **chosen**: ja がデフォルトロケールのため大半は無変更。変更必要 = 4 校正 (種類/管理のしかた/買い物リストを作る/問題なし) + enum ラベル表示化 (category option が water→水) のアサーション + aria template 変更分。
- **反映先**: 002 PLAN Phase 4 (test 追従に明記済)

## 3. コードベース調査結果

### 3.1 既存パターン
- 文字列は全ハードコード (i18n ライブラリ未導入)。injectable backend (memory/http)、keyless bootstrap (main.tsx)。Zod スキーマ (itemSchema/feedbackSchema) は純粋関数で message に日本語固定。
- enum (ITEM_CATEGORIES 等) は単一定義 (db/enums.ts)、ItemForm の `<option>` が **enum 生値をそのまま表示** (water/food)。→ labels.ts で解消 (SPEC 既載)。

### 3.2 影響範囲分析
| 変更対象 | 既存呼び出し/assert | 破壊リスク |
|---|---|---|
| 全 UI コンポーネント (~15) | t() 置換 | 中 (網羅性、grep でゼロ確認) |
| *.test.tsx (~11) | getByText/getByRole(name) で JP assert | 中 (ja デフォルトで多くは無変更、変更分は追従) |
| itemSchema/feedbackSchema | API/makeFeedback が safeParse 利用 | 低 (message をキー化、検証ロジック不変) |
| main.tsx | i18n import 追加 | 低 |

### 3.3 責務評価
- i18n は新規横断基盤、既存責務の流用なし。labels.ts が enums を読むのは正当 (表示層の関心)。Zod は検証責務のまま (t 非依存)。

## 4. 設計判断ログ

| # | 判断項目 | 結論 | chosen_type | 反映先 |
|---|---|---|---|---|
| D1 | 抽出漏れ 7 キー | SPEC §4 追加 | auto-recommended | 001 §4 |
| D2 | aria 接尾辞 | 完全文 interpolation キー | auto-recommended | 001 §4/§6 |
| D3 | Zod エラー翻訳 | message=キー格納 / 表示層 t() | auto-recommended | 001 §5.2 / 003 |
| D4 | 100円 分割文 | 1 キー 1 完全文 | auto-recommended | 001 §4 |
| D5 | main init | config.ts を main で import | auto-recommended | 002 Phase 3 |

## 5. 次のステップ
- 反映済み 001/002/003 を確認
- `/flow:tdd` で実装着手 (deps 追加後 secure --phase=deps 再実行)
<!-- auto-generated-end -->
