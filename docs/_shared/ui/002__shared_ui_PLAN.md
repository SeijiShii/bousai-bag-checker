# _shared/ui 実装計画書 (横断基盤)

> **入力**: `./001__shared_ui_SPEC.md`, `../../design/design-system.md`, `../../concept.md` §1.4 / §4.2
> **最終更新**: 2026-05-26

---

## 1. 実装対象ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `tailwind.config.ts` | design-system トークンを theme に (色/タイポ/余白/角丸/影) | design-system.md | 90 |
| `src/styles/globals.css` | CSS カスタムプロパティ (--color-* 等) + base スタイル + フォント | tailwind | 80 |
| `src/components/ui/button.tsx` | Button (primary/secondary/ghost) | tokens | 60 |
| `src/components/ui/card.tsx` | Card | tokens | 30 |
| `src/components/ui/status-chip.tsx` | StatusChip (fresh/warn/expired) + アイコン | tokens, lucide | 50 |
| `src/components/ui/field.tsx` | Field/Input/Select/Textarea + ラベル + エラー表示 | tokens | 90 |
| `src/components/ui/dialog.tsx` | Modal/Dialog (フォーカストラップ) | tokens | 70 |
| `src/components/layout/bottom-nav.tsx` | モバイルボトムタブ (品目/点検/買い物/設定) | tokens, lucide | 60 |
| `src/components/ui/empty-state.tsx` | EmptyState (SVG + 文言 + CTA) | illustrations | 40 |
| `src/components/ui/info-button.tsx` | InfoButton + WhatIsThisModal (O41) | dialog | 70 |
| `src/components/illustrations/*.tsx` | 自作 SVG イラスト (空状態/ヒーロー/鮮度) line-art | — | 120 |
| `src/components/ui/index.ts` | 公開エクスポート | 上記 | 20 |

## 2. 実装 Phase 分割 (/flow:tdd 連携)

### Phase 1 (RED→GREEN→IMPROVE): トークン基盤
- 対象: `tailwind.config.ts` + `globals.css` (design-system §2-4 のトークンを実装)
- テスト対象: トークンが解決する (CSS 変数 / Tailwind クラスが期待色/値を返す)
- ゴール: `bg-primary` 等が design-system の hex を返す

### Phase 2: 基本コンポーネント
- 対象: button / card / status-chip / field / dialog
- テスト対象: variant/status ごとのトークン適用、role/name、focus、StatusChip の3状態色マッピング
- ゴール: render + a11y role/name + 状態色がトークン通り

### Phase 3: レイアウト + 入口導線 + イラスト
- 対象: bottom-nav / empty-state / info-button + WhatIsThisModal / illustrations
- テスト対象: InfoButton クリックでモーダル開閉、EmptyState の CTA、絵文字不使用
- ゴール: 入口の「これは何?」導線 (O41) が機能、空状態が SVG で出る

> 視覚的な見た目の最終確認 (レイアウト崩れ/階層/コントラスト) は、画面実装後に `/flow:design --review-only` の headless スクショ視覚レビューで担保 (本基盤単体では unit + a11y まで)。

## 3. 依存関係順序
```
design-system.md → tailwind.config + globals.css (tokens)
  → button/card/status-chip/field/dialog (base components)
  → bottom-nav/empty-state/info-button/illustrations (composite)
```
本基盤は依存先なし (concept §1.3.4 P1)。

## 4. 既存ファイルへの影響
新規 PJ。本基盤が全画面の UI 部品の基礎になる。

## 5. 横断フォルダへの追加・変更
- design/design-system.md を参照 (SoT)。トークンの変更は design-system.md → 本基盤の順で反映 (SoT 優先)。

## 6. リスク・注意点
- **生 hex 直書きの混入防止**: 画面実装時に生スタイルを書かせない (lint or レビューでトークン経由を担保)。
- **絵文字混入防止**: UI アイコンは lucide/SVG のみ (design-system §7、レビュー観点)。
- **トークン SoT の二重管理回避**: design-system.md が SoT、tailwind.config はその実装。値のズレに注意。
- 視覚崩れは unit では捕捉しきれない → /flow:design --review-only (headless スクショ) が後段で担保。

## 7. 完了の定義 (DoD)
- [ ] design-system トークンが tailwind.config + globals.css に反映
- [ ] 基本コンポーネント (button/card/status-chip/field/dialog/bottom-nav/empty-state/info-button) が render + a11y テスト通過
- [ ] lucide 導入 + 自作 SVG イラスト生成 (絵文字不使用)
- [ ] StatusChip の3状態色が design-system トークン通り
- [ ] InfoButton + WhatIsThisModal (O41) が動作
- [ ] 単体テストカバレッジ 80%/70%
- [ ] 視覚レビューは画面実装後 /flow:design --review-only で実施 (統合は機能側 E2E でカバー)

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (トークン + 基本コンポーネント + 3 Phase) | /flow:feature |
