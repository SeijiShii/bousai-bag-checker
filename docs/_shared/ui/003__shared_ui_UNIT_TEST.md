# _shared/ui 単体テスト計画 (横断基盤)

> **入力**: `./001__shared_ui_SPEC.md`, `./002__shared_ui_PLAN.md`, `../../design/design-system.md`
> **最終更新**: 2026-05-26

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | tokens | `--color-primary` | `#2E8B74` を返す (design-system §2 と一致) |
| U-N2 | Button variant=primary | render | primary 色 + primary-fg 文字 + role=button + アクセシブル名 |
| U-N3 | StatusChip status=fresh/warn/expired | 各 status | fresh→`#4CA085` / warn→`#C98A3B` / expired→`#C25B4E` のトークン適用 + 対応アイコン |
| U-N4 | Field with label | label="数量" | label が常時表示 + input に関連付け (aria) |
| U-N5 | InfoButton クリック | click | WhatIsThisModal が開く (concept §1 由来の説明文を含む) + 閉じる |
| U-N6 | EmptyState | data 0件 | SVG イラスト + 文言 + CTA ボタン |
| U-N7 | BottomNav | render | 4 タブ (品目/点検/買い物/設定)、アクティブタブ強調 |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | Field error 状態 | error prop あり | expired 色ボーダー + 補足文表示、**点滅しない** (O38 トーン) |
| U-E2 | Button disabled | disabled | クリック無効 + aria-disabled |
| U-E3 | イラスト/画像 読込失敗 | 不正 src | alt / フォールバック表示 |

### 1.3 境界値 / 規約
| ID | 対象 | 境界 | 期待振る舞い |
|---|---|---|---|
| U-B1 | 全コンポーネント | 絵文字混入チェック | コンポーネント出力に絵文字が含まれない (lucide/SVG のみ、design-system §7) |
| U-B2 | Button タップ領域 | モバイル | 最小 44×44px を満たす |
| U-B3 | コントラスト | text/bg, primary-fg/primary | WCAG AA (4.5:1) を満たす |
| U-B4 | 生 hex 直書き検出 | コンポーネント | 生 hex でなくトークン/CSS変数経由 (静的チェック or レビュー観点) |

## 2. Mock 方針

| 対象 | 方針 | 理由 |
|---|---|---|
| DOM | testing-library + jsdom | render / role / name / クリックを検証 |
| アイコン (lucide) | 実物 (軽量) | 描画確認 |
| 外部 API / DB | なし | UI 基盤は副作用なし |
| 視覚的レイアウト崩れ | unit では非対象 | /flow:design --review-only (headless スクショ) が後段で担保 |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行カバレッジ | 80% | concept 継承 |
| 分岐カバレッジ | 70% | concept 継承 |
| a11y (role/name/focus) | 主要コンポーネント必須 | design-system §8 |

## 4. 既存ユーティリティ依存
- design-system.md トークン (SoT)。tailwind.config / globals.css の値と一致を検証。

## 5. テスト実行環境
- フレームワーク: vitest + @testing-library/react + jsdom (concept §4.3 想定スタック)
- 視覚回帰: 本基盤では非対象 (画面実装後に Playwright + /flow:design --review-only)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (トークン/コンポーネント/a11y/絵文字不使用を検証) | /flow:feature |
