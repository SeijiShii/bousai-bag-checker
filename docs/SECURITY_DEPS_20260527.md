# 依存ライブラリ脆弱性スキャン結果 (L4)

**スキャン日**: 2026-05-27 (+09:00)
**対象**: `package-lock.json` (npm)
**スキャナ**: `npm audit`
**起動元**: `/flow:auto` §3.0c 鮮度ゲート (前回 secure は concept L1 のみ、以降に全実装 + lock 生成 + 新 endpoint) → `/flow:secure --phase=deps`
**観点ソース**: perspectives O28 (依存ライブラリ脆弱性)

## 1. サマリ

| severity | スキャン時 | 対応後 |
|---|---|---|
| Critical | 0 | 0 |
| High | **1** | **0** ✅ |
| Moderate | 8 | 8 (dev-only、defer) |
| Low / Info | 0 | 0 |
| **合計** | 9 | 8 |

- **対応必須 (High)**: 1 件 → **本セッションで解消** (drizzle-orm 0.36.4 → 0.45.2)
- §8 登録: [SEC-005] (closed) + [SEC-006] (open/deferred)

## 2. High 詳細 (解消済)

### [SEC-005] drizzle-orm SQL injection via improperly escaped SQL identifiers
- **パッケージ**: `drizzle-orm@0.36.4` (本番依存) → range `<0.45.2`
- **Advisory**: GHSA (Drizzle ORM SQL injection via improperly escaped SQL identifiers)
- **severity**: High
- **影響範囲**: 直接依存 (本番ランタイム、`src/db` 全クエリ)
- **本 PJ の実エクスポージャ**: **低**。本 PJ は SQL 識別子 (テーブル/カラム名) をユーザー入力から動的構築していない (静的 schema + パラメータ化された `withOwner` + 静的 `sql\`count(*)::int\``)。本 advisory の vector (動的識別子) には該当しにくい。ただし公開 PJ のため予防的にアップグレード。
- **対応**: `drizzle-orm@^0.45.2` へアップグレード (本セッションで実施)
  - npm は 0.x semver のため major 扱いだが、本 PJ の使用 API (pgTable / columns / withOwner / sql template) に破壊的変更なし
  - **検証**: `tsc --noEmit` clean / 全 145 テスト green / `npm run build` 成功 / 再 audit で High=0
- **status**: `closed` (本コミットで解消)

## 3. Moderate 8 件 (dev-only build toolchain、defer)

| パッケージ | Advisory 概要 | 本番影響 | 対応 |
|---|---|---|---|
| esbuild (≤0.24.2) | dev server が任意オリジンからのリクエストに応答 (GHSA-67mh-4wv8-2f99) | **なし** (dev server のみ。本番は静的 build + serverless) | defer |
| vite | Optimized Deps `.map` のパストラバーサル | **なし** (dev server のみ) | defer |
| vite-node / @vitest/mocker / vitest | vite 経由の推移的 | **なし** (テスト実行時のみ) | defer |
| @esbuild-kit/core-utils / esm-loader / drizzle-kit | esbuild 経由の推移的 (drizzle-kit のビルド時) | **なし** (`db:generate` 時のみ) | defer |

- **defer 理由**: いずれも **dev/build/test ツールチェーン**で、Vercel 本番ランタイム (静的アセット + serverless functions) には同梱されない。修正はすべて `isSemVerMajor`=true (vite 5→7 / vitest 2→3 等の大型ツールチェーン移行) で、本番リスクゼロに対し回帰リスクが高い。
- **推奨**: L4-cont (継続監視) に委譲 — `.github/dependabot.yml` で dev deps の自動 PR を受け、ツールチェーン移行は独立して計画的に実施。

## 4. §8 登録

| 論点 ID | severity | title | status |
|---|---|---|---|
| [論点-008] [SEC-005] | High | drizzle-orm SQL injection | **closed** (本セッション、drizzle-orm 0.45.2) |
| [論点-009] [SEC-006] | Medium | dev-toolchain CVE ×8 (esbuild/vite/vitest) | open / deferred (dev-only、Dependabot 監視) |

## 5. 自動更新メカニズムの推奨 (L4-cont)

- [ ] `.github/dependabot.yml` を追加し dev deps の CVE を自動 PR (esbuild/vite/vitest 系の defer 分をここで継続監視)
- [ ] CI に `npm audit --audit-level=high` を組み込み、High 以上で fail (本番依存の新規 High を release ブロック)

## 6. アップグレード手順 (実施済)

```bash
npm install drizzle-orm@^0.45.2   # 0.36.4 → 0.45.2 (High SQLi 解消)
npm run typecheck && npm test && npm run build   # 全 green 検証済
```
