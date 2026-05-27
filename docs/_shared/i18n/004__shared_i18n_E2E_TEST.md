# _shared/i18n E2E テスト計画

> **入力**: `./001__shared_i18n_SPEC.md`, `../../concept.md` §1.1
> **最終更新**: 2026-05-27
> **備考**: cross-cutting だが言語切替は UI ジャーニーがあるため E2E を生成 (他の _shared と異なる)。`/flow:e2e` で実行 (ローカル headless、Class A)。

---

## 1. ユーザージャーニー (言語切替)

| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| I18N-S1 (default ja) | localStorage 空、navigator=ja | アプリ起動 | UI が日本語 (ナビ「品目/点検/買い物/設定」、`<html lang=ja>`) |
| I18N-S2 (switch en) | S1 状態 | LanguageSwitcher で English を選択 | UI が即時英語化 (ナビが Items/Inspection/... 等)、`<html lang=en>` |
| I18N-S3 (persist) | S2 後 | ページリロード | 英語のまま (localStorage 永続)、再検出されない |
| I18N-S4 (switch ko/zh) | 任意状態 | 한국어 / 中文(简) を選択 | 各言語に切替、ナビ・主要ラベルが対応言語 |
| I18N-S5 (browser detect) | localStorage クリア、navigator=`en-US` | 起動 | 英語で初期表示 (検出) |
| I18N-S6 (legal JA 正本) | locale=en | フッタ「プライバシーポリシー」相当→法務ページ遷移 | 本文は日本語、冒頭に「正本は日本語」相当の注記が表示 |
| I18N-S7 (enum ラベル) | locale=ja | 品目追加フォームを開く | 種類ドロップダウンが「水/食料/電池/医薬品/書類/その他」(enum 生値 water/food でない) |

## 2. 環境要件
| 項目 | 要件 |
|---|---|
| ブラウザ | Chromium (system chrome、既存 E2E と同じ headless 構成) |
| 画面サイズ | モバイル基準 (PWA) |
| オフライン | 不要 |
| 認証 | keyless dev (memory backend、既存 E2E 同様) |
| ロケール制御 | `localStorage` 操作 + `context({ locale })` / navigator override |

## 3. データセットアップ
### 3.1 Seed
- 既存 keyless dev の memory seed (品目数件) を流用 (S7 の enum ラベル確認用に品目フォーム到達)。
### 3.2 Cleanup
- localStorage を各テスト前にクリア (検出/永続の独立性)。

## 4. タグ別追加シナリオ (i18n)
- ロケール切替シナリオ = 本計画の主軸 (S2/S4)。
- 切替後にキー名がそのまま画面に出ていない (欠落フォールバックが効いている) ことを S2 で確認。

## 5. レイアウト・ビジュアル検証
- **Level 1 (snapshot)**: ❌ (既存画面の snapshot は各 feature E2E が担当。i18n は文字列変化が主で、言語別 snapshot は過剰)
- **Level 2 (意味的)**: ✅ 最小 — LanguageSwitcher がヘッダ内に存在し可視、切替後にナビ文字列が変化することを DOM assert。
- **Level 3 (AI Vision)**: ❌ (コスト不要)

## 6. 期待 KPI
| 指標 | 目標 |
|---|---|
| シナリオ成功率 | 100% (I18N-S1〜S7) |
| キー欠落 (画面にキー名露出) | 0 |

## 7. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 | /flow:feature |
