# _shared/i18n 実装計画書

> **入力**: `./001__shared_i18n_SPEC.md`, `../../concept.md` §1.4, D20260527-101
> **最終更新**: 2026-05-27

---

## 1. 実装対象ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/i18n/config.ts` | i18next init + LanguageDetector + resources(遅延) + fallbackLng='ja' | react-i18next, i18next, i18next-browser-languagedetector | ~40 |
| `src/i18n/locales/ja.json` | 正本カタログ (SPEC §4 の ja 値) | — | ~70 |
| `src/i18n/locales/en.json` | 英語訳 | — | ~70 |
| `src/i18n/locales/zh-Hans.json` | 簡体中国語訳 | — | ~70 |
| `src/i18n/locales/ko.json` | 韓国語訳 | — | ~70 |
| `src/i18n/useLocale.ts` | `useLocale()` フック (locale 取得/setLocale + localStorage `bousai.locale` + `<html lang>` 同期) | config | ~30 |
| `src/i18n/format.ts` | formatDate/formatNumber (Intl) | — | ~20 |
| `src/i18n/labels.ts` | enum→キーのマップ (category/freshness/reason) + categoryLabel/freshnessLabel ヘルパ | enums | ~25 |
| `src/components/ui/LanguageSwitcher.tsx` | 言語切替 UI (4 言語、lucide Globe アイコン、aria) | useLocale, ui | ~45 |

## 2. 実装 Phase 分割 (/flow:tdd-phase 連携)

### Phase 1 (RED→GREEN→IMPROVE): i18n 基盤 + ja カタログ + 検出
- `config.ts` (i18next init, fallbackLng=ja, detector: localStorage→navigator→ja, 正規化)
- `ja.json` (SPEC §4 全キー、承認済み 4 校正反映)
- `useLocale.ts` (localStorage 永続 + html lang 同期)
- `format.ts` / `labels.ts`
- テスト: 検出優先順位、正規化 (zh-CN→zh-Hans 等)、ja フォールバック、format

### Phase 2: en/zh-Hans/ko 翻訳生成
- `en.json` / `zh-Hans.json` / `ko.json` を ja から生成 (design-system ボイス踏襲、`header.title` は各言語自然表記)
- テスト: 全ロケールが ja と同一キー集合を持つ (キー欠落ゼロ)、各ロケールで t() が訳を返す

### Phase 3: LanguageSwitcher + main.tsx 配線
- `LanguageSwitcher.tsx` 実装、`AppHeader` に配置 (InfoButton 隣)
- `main.tsx` で i18n import (Provider 不要、init で global)
- テスト: 切替で locale 変化 + localStorage 永続 + html lang 更新

### Phase 4: 全 UI 文字列の t() 置換 (画面単位)
- AppHeader / footer / bottom-nav / 4 screens / ItemForm(+enum ラベル) / ItemList / StatusChip / FeedbackWidget / InspectionChecklist / ShoppingList / SettingsScreen / Field / InfoButton
- itemSchema: エラーメッセージをキー化 (検証は key を返し、表示層で t)
- **承認済み 4 校正は ja.json の値として既に反映済 (置換時にハードコードを撤去)**
- テスト: 既存 role/text テストを t('ja') 期待値に追従更新 (ja がデフォルトなら多くは無変更、変更分のみ修正)

### Phase 5: 法務 JA 正本注記 + 仕上げ
- legal 3 ページ: 非 ja ロケール時に `legal.jaAuthoritative` 注記を本文冒頭に表示、本文は JA 維持
- typecheck / 全テスト green / build 確認

## 3. 依存関係順序
```
config.ts (基盤) → useLocale/format/labels → ja.json → [en/zh/ko].json
   → LanguageSwitcher → main.tsx 配線 → 各 UI の t() 置換 → legal 注記
```

## 4. 既存ファイルへの影響
| ファイル | 変更内容 | リスク |
|---|---|---|
| `main.tsx` | i18n config import | 低 (init のみ) |
| 全 screens/components/features (~15) | ハードコード文字列 → t() | 中 (網羅性、テスト追従) |
| 各 *.test.tsx (role/text) | 期待文字列を ja カタログ値に追従 | 中 (ja デフォルトなら差分小) |
| `package.json` | react-i18next + i18next + i18next-browser-languagedetector 追加 | 低 |

## 5. 横断フォルダへの追加・変更
- `_shared/i18n` 新規 (本体)。`_shared/ui` のコンポーネントは t() を受け取る/呼ぶ形に微修正。

## 6. リスク・注意点
- **文字列の取りこぼし**: 接尾辞・区切り (CLAUDE.md 方針) や enum 生値表示 (ItemForm option) を漏らさない。grep で日本語ハードコード残存を検出してゼロにする。
- **テスト追従**: ja がデフォルトロケールなら既存 getByText は概ね通るが、4 校正の変更分 (種類/管理のしかた/買い物リストを作る/問題なし) + enum ラベル表示化でテスト更新が必要。
- **deps 追加後**: `/flow:secure --phase=deps` 再実行 (鮮度トリガ、react-i18next 系の CVE 確認)。
- **バンドル**: 遅延ロードで初期 1 ロケールのみ。build サイズを確認。

## 7. 完了の定義 (DoD)
- [ ] 4 ロケール JSON がキー集合一致 (欠落ゼロ) + 全 UI が t() 化 (日本語ハードコード grep ゼロ、コメント/型/テスト除く)
- [ ] LanguageSwitcher で 4 言語切替 + localStorage 永続 + html lang 同期
- [ ] enum (category/freshness) がロケールラベル表示 (生値表示の解消)
- [ ] 法務ページが非 ja で「正本は日本語」注記 + 本文 JA
- [ ] 全 unit + E2E green、typecheck clean、build OK
- [ ] 承認済み 4 wording 校正が ja カタログに反映

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 | /flow:feature |
