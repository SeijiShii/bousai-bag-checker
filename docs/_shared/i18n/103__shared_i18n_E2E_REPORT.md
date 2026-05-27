# E2E テストレポート: _shared/i18n

- **状態**: E2E green
- **FW**: Playwright (channel:chrome, headless, locale=ja-JP pinned)　実行: `npx playwright test`　対象 URL: ローカル dev (memory backend, keyless)
- **last_updated**: 2026-05-27

## journey 別結果 (004 由来 S1-S7)
| journey | spec | 結果 |
|---|---|---|
| I18N-S1 既定 ja (ナビ JP + html lang=ja) | e2e/i18n.spec.ts | pass |
| I18N-S2/S3 en 切替 → 即時英語化 + html lang=en + リロード永続 | e2e/i18n.spec.ts | pass |
| I18N-S4 ko / zh-Hans 切替 | e2e/i18n.spec.ts | pass |
| I18N-S5 Accept-Language=en で初期 en 検出 | e2e/i18n.spec.ts | pass |
| I18N-S6 法務ページ非 ja で「正本は日本語」注記 + 本文 JA | e2e/i18n.spec.ts | pass |
| I18N-S7 品目フォームの種類が enum 生値でなくロケールラベル | e2e/i18n.spec.ts | pass |
| I18N キー名の画面露出なし (フォールバック健全) | e2e/i18n.spec.ts | pass |

**全体 E2E スイート: 18 passed** (i18n 7 + 既存 inventory/feedback/inspection/shopping 11)。flaky なし。

## 検出した実装バグ (E2E で発見 → 即修正)
- **html lang が初期検出/リロード時に同期されていなかった** (`syncHtmlLang` が setLocale でしか呼ばれず、init/検出時は index.html の既定のまま)。S5(検出)・S2(リロード後 lang) が RED。
  → `src/i18n/config.ts` に `i18n.on('languageChanged', applyHtmlLang)` + 初期 `applyHtmlLang(i18n.language)` を追加して一元同期。GREEN 化。i18n の自前バグのため fix seed でなく本セッションで即修正 (feature 未リリースのため)。

## 既存 spec の i18n 追従
- playwright.config: `locale: 'ja-JP'` 固定 (検出が navigator 依存で揺れないように)。
- inventory.spec: 鮮度OK → 問題なし / shopping.spec: リストを生成 → 買い物リストを作る (承認済み校正反映)。
- LanguageSwitcher に `data-testid="language-switcher"` 追加 (安定セレクタ)。

## metrics
metrics: { e2e_specs: 5 files, i18n_journeys: 7, pass: 18, fail: 0, flaky: 0, bug_found_fixed: 1 (html lang) }
