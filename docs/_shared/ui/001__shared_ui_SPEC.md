# _shared/ui 仕様書 (横断基盤)

> **役割**: UI 基盤。design-system.md SoT のトークンを実装に落とし込み、shadcn/ui + Tailwind ベースの基本コンポーネント + 自作 SVG イラスト + lucide アイコンを全機能に提供する。
> **タグ**: cross-cutting
> **最終更新**: 2026-05-26
> **入力アーティファクト**: `../../concept.md` (§1.4 / §3 / §4.2 / §4.9), `../../design/design-system.md` (SoT), `./README.md`
> **target_type**: cross-cutting (提供インターフェース形式。E2E はスキップ=視覚レビューは /flow:design --review-only)

---

## 1. 提供インターフェース

design-system.md (ティールグリーン) を単一情報源として、以下を提供する。

### 1.1 デザイントークン (Tailwind theme + CSS 変数)
- design-system §2 カラー / §3 タイポ / §4 形・影・余白 を Tailwind theme + CSS カスタムプロパティに実装。
- 画面は生 hex を使わずトークン (`bg-surface` / `text-muted` / `rounded-lg` 等) を使う。
- 状態色 3 段階 (`fresh` / `warn` / `expired`) をセマンティックトークンとして提供。

### 1.2 基本コンポーネント (shadcn/ui ベース + トークン適用)
| コンポーネント | 期待動作 |
|---|---|
| `Button` (primary/secondary/ghost) | radius-md、最小タップ 44×44、focus ring、disabled |
| `Card` | surface + shadow-sm + radius-lg + padding |
| `StatusChip` (status: fresh\|warn\|expired) | 淡背景 + 濃文字 + 小アイコン。鮮度3段階を一目で。**純赤・点滅なし** |
| `Field` / `Input` / `Select` / `Textarea` | ラベル常時表示、focus ring、エラー時 expired 色 + 補足文 (点滅なし) |
| `BottomNav` (mobile) | 品目/点検/買い物/設定 の 4 タブ。デスクトップは別レイアウト |
| `EmptyState` | 自作 SVG イラスト + 一言 + 次アクション |
| `InfoButton` + `WhatIsThisModal` (O41) | 丸付き「?」+ 軽量モーダル。入口でサービスの正体を説明 (内容は concept §1 由来) |
| `Modal` / `Dialog` | shadow-md + radius-lg、フォーカストラップ |

### 1.3 アイコン & イラスト
- `lucide` アイコンセット導入 (絵文字不使用)。
- 自作 SVG イラストコンポーネント (`currentColor`/テーマ色追従、line-art): 空状態 / 入口ヒーロー / 鮮度3段階アイコン。

### 1.4 トーン (ボイス & コピー)
- design-system §6 のトーン基準を提供 (淡々・煽らない・O38 技術用語 NG)。文言自体は各機能 + `/flow:wording` が確定。

---

## 2. 入出力

### 2.1 提供 API (コンポーネント props、概念)
- 各コンポーネントは props (variant / status / size / disabled 等) を受け取り、トークン適用済みの UI を返す。生スタイルの上書きは最小限。

### 2.2 副作用
- なし (純粋な表示層)。状態管理・データ取得は各機能の責務。

---

## 3. データモデル
該当なし (UI 基盤、永続データを持たない)。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
該当なし (入力検証は各機能が Zod で、本基盤は Field の表示制御のみ提供)。

### 4.2 エラーケース (表示観点)
| ID | 条件 | 振る舞い |
|---|---|---|
| UI-E1 | Field エラー状態 | expired 色のボーダー + 補足文を表示 (点滅させない、O38 トーン) |
| UI-E2 | EmptyState (データ0件) | イラスト + 「まだ〜ありません」+ 次アクション CTA |
| UI-E3 | 非対応ブラウザ/画像読込失敗 | フォールバック (alt テキスト / プレースホルダ) |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| バンドルサイズ | Tailwind purge + tree-shaking で最小 | 低頻度利用・PWA、初期表示 <1.5s (§3) |
| アクセシビリティ | WCAG A 基本 (role/name/focus/コントラスト AA) | design-system §8、シニア層も想定 |
| 一貫性 | 全画面トークン経由 (生 hex 直書きゼロ) | design-system §2 原則 |
| 絵文字 | UI アイコンに不使用 (lucide/SVG) | design-system §7 |

### 5.2 既存機能連携 (被依存)
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| 全機能 (inventory/inspection/shopping-list/feedback 等) | UI 部品 | Button/Card/StatusChip/Field/EmptyState/BottomNav 等を使用 |
| design/design-system.md | SoT | トークン・コンポーネント仕様・トーンの単一情報源 |

---

## 6. タグ別追加項目
cross-cutting。i18n タグなし (concept §国内向け JA 単一、多言語は v2 以降)。

---

## 7. スコープ外
- 各画面の具体レイアウト (機能側の責務)。
- 文言の確定 (`/flow:wording`)。
- ダークモード (MVP 外、トークン設計は将来対応しやすい構造にとどめる)。
- 多言語 (i18n、v2)。

## 8. 未決事項 (論点リスト)
現時点で論点なし (2026-05-26)。design-system.md が方向を確定済み (ティールグリーン)。視覚的な最終調整は画面実装後の `/flow:design --review-only` で実施。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (design-system トークン + 基本コンポーネント + lucide/SVG + O41 InfoButton) | /flow:feature |
