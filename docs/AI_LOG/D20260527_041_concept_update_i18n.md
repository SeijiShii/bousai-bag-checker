# AI_LOG セッション D20260527_041 — /flow:concept (UPDATE, 多言語対応 i18n スコープ追加)

**実行日時**: 2026-05-27 16:25 (+09:00)
**コマンド**: /flow:concept (UPDATE, スコープ追加)
**状態**: 完了
**含まれる decision**: D20260527-100 〜 D20260527-101
**起動元**: ユーザー指示「このアプリは多言語対応したい」(Wording gate 実行中に pivot)
**Resume Contract 準拠**

---

## 主要決定サマリ
- **ユーザー pivot**: /flow:auto ループが Class C/B 境界 (Wording gate) に到達 → ユーザーが新要件「多言語対応」を提示 → wording 校正(ハードコード JA)を中断し i18n 基盤導入へ方針転換
- **i18n 設計判断 4 件確定**:
  1. 対応言語 = ja(正本) + en + zh-Hans + ko (日本の防災情報標準 4 言語)
  2. ライブラリ = react-i18next (ロケール検出 + JSON 遅延ロード + 切替 UI)
  3. 翻訳スコープ = UI チロームのみ 4 言語、法務長文は JA 正本(特商法は日本法固有)
  4. 法務ページに「正本は日本語」注記、zh/ko/en は法務を JA フォールバック
- concept 反映: §1.2 スコープ / §1.3.2 横断 `_shared/i18n` 新設 / §1.3.4 P1 / §3 国際化 NFR / §9.2 注記 / §7 / §11

## 生成・更新ファイル
- `docs/concept.md` (§1.2/§1.3.2/§1.3.4/§3/§7/§9.2/§11)
- `docs/_shared/i18n/README.md` + `INDEX.md` (新設)
- `docs/INDEX.md` (横断フォルダ表に i18n 追加)
- `docs/AI_LOG/D20260527_041_concept_update_i18n.md` (本ファイル) + INDEX

## 次のステップ (flow)
1. `/flow:feature _shared/i18n` — SPEC/PLAN/UNIT_TEST/E2E 設計 (react-i18next 設定 / カタログ構造 / キー命名 / 検出 / 切替 UI / 整形 / 文字列抽出インベントリ)
2. `/flow:spec-review _shared/i18n` (P3.7)
3. `/flow:tdd` — 実装 (install + 全文字列キー化 + en/zh/ko 翻訳 + LanguageSwitcher)。**承認済み 4 wording 校正 (種類/管理のしかた/買い物リストを作る/問題なし) を JA カタログ値に反映**
4. `/flow:e2e _shared/i18n` — 言語切替ジャーニー
5. `/flow:wording` — JA カタログ校正 + en/zh/ko 訳レビュー (i18n 完成後に本来の wording gate を実施)

## 保留メモ
- 作業ツリーに未コミットの ItemForm「区分→種類」編集あり (承認済み校正の 1 件)。i18n 抽出時に JA カタログ値として取り込む (standalone commit しない)。
- deps に react-i18next + i18next-browser-languagedetector 追加予定 → 追加後 secure --phase=deps 再実行 (鮮度トリガ)

---

## decisions

### D20260527-100
- question: /flow:auto ループの Class C/B 境界 (Wording gate) でユーザーが新要件を提示
- chosen: wording 校正(ハードコード JA)を中断 → 多言語対応 i18n 基盤導入へ pivot。i18n 完成後に wording gate を catalog に対して実施
- chosen_type: explicit-choice (ユーザー指示)
- context: 全 no-key Class A 完了 + Class C/B gate 提示 (D-035 ループ) に対し、ユーザーが「多言語対応したい」と pivot。i18n は単なる文言校正でなく基盤導入のため concept スコープ変更が必要
- depends_on: [D20260527-089]

### D20260527-101
- question: i18n の設計判断 (言語 / ライブラリ / 翻訳スコープ)
- chosen: ja(正本)+en+zh-Hans+ko の 4 言語 / react-i18next / UI チロームのみ 4 言語・法務長文は JA 正本(各ページ「正本は日本語」注記、zh/ko/en は法務 JA フォールバック)
- chosen_type: explicit-choice (3 連 AskUserQuestion で確定)
- context: 防災備蓄アプリ・日本国内向け。在留外国人/訪日者の言語アクセシビリティ(海外事業展開ではない)。法務は日本法固有 + 誤訳責任回避で JA 正本維持。Vite+React SPA・SSR なしで react-i18next が低リスク標準
- depends_on: [D20260527-100]
