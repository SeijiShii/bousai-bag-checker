# 実装レポート: _shared/ui

## 実装日時
2026-05-27 (JST)

## モード
feature (cross-cutting)

## 関連ドキュメント
- [001__shared_ui_SPEC.md] / [002__shared_ui_PLAN.md] / [003__shared_ui_UNIT_TEST.md]
- [AI_LOG](../../AI_LOG/D20260527_021_tdd__shared_ui.md)

## 変更一覧

### Phase 1: トークン基盤
- `src/lib/tokens.ts`: design-system(ティールグリーン)の色/角丸/余白/フォントサイズの単一ソース。`tailwind.config.ts` が consume、`src/styles/globals.css` に CSS 変数
- React/Vite/Tailwind/testing-library/lucide を scaffold に追加 (postcss.config.js / vitest jsdom 設定 / tsconfig jsx)

### Phase 2: 基本コンポーネント (src/components/ui/, layout/)
- `button.tsx`: primary/secondary/ghost、min 44px タップ、focus ring、disabled
- `card.tsx`: surface + shadow + radius-lg
- `status-chip.tsx`: 鮮度3段階(fresh/warn/expired)、トークン色、lucide アイコン、純赤・点滅なし
- `field.tsx`: label 常時表示 + error(expired 色・点滅なし)+ aria-invalid/describedby
- `info-button.tsx`: O41 入口「これは何?」(丸付き?+ 軽量モーダル、role=dialog)
- `empty-state.tsx`: SVG イラスト枠 + 文言 + CTA
- `bottom-nav.tsx`: 品目/点検/買い物/設定 タブ、aria-current
- `lib/cn.ts`: クラス合成 (clsx)

## 実装計画からの差分
| 項目 | 内容 |
|---|---|
| 計画にない追加 | frontend scaffold 一式(React/Vite/Tailwind、greenfield のため) |
| 後続/レビュー回し | 自作 SVG イラスト本体・各画面への適用・視覚総合は **画面実装後 /flow:design --review-only** (headless スクショ)で担保。本 lib は token + 部品 + a11y/絵文字不使用の unit まで |
| 注意 | npm install で 9 件の依存脆弱性警告 → /flow:secure --phase=deps で対応予定 |

## PR Description
### タイトル
_shared/ui: design-system トークン + 基本コンポーネント
### 概要
ティールグリーンのデザイントークンを実装に落とし、全機能が使う基本 UI 部品(Button/Card/StatusChip/Field/InfoButton/EmptyState/BottomNav)を提供。
### テスト
- 13 テスト green(tokens 4 + components 9)。絵文字不使用・a11y・3状態色をカバー。typecheck clean。
