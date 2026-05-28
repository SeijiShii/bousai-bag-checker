# 依存ライブラリ脆弱性スキャン結果 — 2026-05-28 (release-pre)

**スキャン日**: 2026-05-28 12:14 (+09:00)
**対象**: package-lock.json (Node.js / npm)
**スキャナ**: `npm audit --json`
**前回スキャン**: `SECURITY_DEPS_20260527.md` (commit `1fd16e9` — drizzle-orm 0.36.4→0.45.2 解消後)
**起動経緯**: `/flow:auto` の P4.7 Release gate 直前の **release-pre 必須監査** (CF-20260528-009) によるトリガ。前回スキャン以降に i18n 関連 deps が追加されたため再スキャン。

---

## 1. サマリ

| severity | 件数 | 前回比 | 対応状況 |
|---|---|---|---|
| Critical | 0 | ±0 | - |
| High | 0 | ±0 | - |
| Moderate | 8 | ±0 | **既存 [論点-009] でカバー済 (deferred)** |
| Low | 0 | ±0 | - |
| **合計** | 8 | ±0 | 新規発生なし |

**結論**: 前回 SECURITY_DEPS_20260527 と完全に同じ 8 件 (esbuild / vite / vitest / drizzle-kit 系の dev-only ツールチェーン CVE)。**i18n 関連の新 deps (`react-i18next` / `i18next` / `i18next-browser-languagedetector`) には CVE 検出なし**。drizzle-orm SQLi (前回 High 1 件) は session 40 で解消済。

---

## 2. 検出された脆弱性

| パッケージ | severity | CVE/Advisory | 影響 | 修正 | 既知論点 |
|---|---|---|---|---|---|
| esbuild | Moderate | GHSA-67mh-4wv8-2f99 | dev server で任意 origin からリクエスト可 (CVSS 5.3) | vite 6.4.2 (SemVer major) | [論点-009] |
| vite | Moderate | GHSA-4w7w-66w2-5vf9 | Optimized Deps `.map` の Path Traversal | vite 6.4.2 | [論点-009] |
| vitest | Moderate | (vite 推移) | (vite 経由) | vitest 4.1.7 (SemVer major) | [論点-009] |
| @vitest/mocker | Moderate | (vite 推移) | (vite 経由) | vitest 4.1.7 | [論点-009] |
| vite-node | Moderate | (vite 推移) | (vite 経由) | vitest 4.1.7 | [論点-009] |
| drizzle-kit | Moderate | (esbuild 推移) | (esbuild 経由) | drizzle-kit 0.31.10 | [論点-009] |
| @esbuild-kit/core-utils | Moderate | (esbuild 推移) | (esbuild 経由) | drizzle-kit 0.31.10 | [論点-009] |
| @esbuild-kit/esm-loader | Moderate | (esbuild 推移) | (esbuild 経由) | drizzle-kit 0.31.10 | [論点-009] |

すべて **dev-only ツールチェーン** (本番 bundle に含まれない)。本番デプロイへの直接的影響なし。

## 3. 既存 [論点-009] との照合

- 論点-009 status: `open (deferred — dev-only、Dependabot 継続監視へ委譲)` (2026-05-27 確定、AUDIT_20260527_1549 でも同方針)
- 本回スキャン結果: 前回と完全に同じ 8 件 → **新規 dispatch 不要**、論点-009 の deferred 方針を維持
- SemVer major 移行 (vite 5.4 → 6.4 / vitest 2.x → 4.1.7) は破壊的変更を伴うため、リリース後に別 issue として `/flow:revise` で対応 (deferred 方針どおり)

## 4. i18n 関連 deps の新規追加チェック

| パッケージ | 直接/推移 | CVE 検出 |
|---|---|---|
| react-i18next | 直接 | なし |
| i18next | 直接 | なし |
| i18next-browser-languagedetector | 直接 | なし |
| i18next-resources-to-backend | 推移 | なし |

→ **i18n 関連で新規脆弱性 finding なし**。

## 5. 自動更新メカニズム (継続監視、L4-cont)

[論点-009] で確定済の方針:
- Dependabot を有効化済 (`.github/dependabot.yml` 想定、CI 設定で継続監視)
- リリース後の SemVer major 移行は `/flow:revise` で個別計画

---

## 監査結論

**release-pre 必須監査として fresh 判定 + 新規 dispatch ゼロ**。8 件はすべて [論点-009] でカバー済の dev-only ツールチェーン CVE で、本番影響なし + deferred 方針確定済。L1 設計レビューも i18n に対する新規脆弱性パターンなし (詳細は §6)。**次は P4.7 Release gate (`/flow:release`) へ合流可能**。

## 6. L1 設計レビュー (--phase=design) 軽量再評価

前回 `SECURITY_REVIEW_20260526.md` 以降の主な設計変更:
- **i18n 追加** (session 41-47): react-i18next + 4 言語カタログ (ja/en/zh-Hans/ko) + 言語切替 UI

i18n 関連の脆弱性観点照合:

| 観点 | 該当 | 結果 |
|---|---|---|
| O23 認可漏れ | i18n は認可境界に影響しない (UI 層のみ) | 該当なし |
| O24 入力検証 | ロケールキーは enum 制約 (4 言語のみ)、`zod` で検証 | 対応済 |
| O25 秘密情報 | 翻訳ファイルは静的 JSON、秘密情報含まず | 該当なし |
| O26 PII ログ | i18n は本番ログに出力しない | 該当なし |
| O27 レート制限 | i18n は API endpoint を持たない | 該当なし |
| **XSS リスク (i18n 固有)** | `t()` の戻り値を React JSX で render → React の自動 escape が効く。`dangerouslySetInnerHTML` は使用していない | **対応済 (React 標準で安全)** |
| **翻訳ファイル汚染** | カタログはソース管理下の静的 JSON、外部入力なし | 該当なし |

→ **i18n 追加に対する新規 SEC finding ゼロ**。`SECURITY_REVIEW_20260526.md` の既存 finding (SEC-001〜SEC-007、すべて accepted-as-requirement / dispatched-to-feature / closed) を維持。
