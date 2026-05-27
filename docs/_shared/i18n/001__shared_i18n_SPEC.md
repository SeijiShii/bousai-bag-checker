# _shared/i18n 機能仕様書

> **役割**: 多言語基盤。UI を ja(正本)/en/zh-Hans/ko の 4 言語で提供する横断基盤。
> **タグ**: cross-cutting, i18n
> **最終更新**: 2026-05-27
> **入力アーティファクト**: `../../concept.md` (§1.2/§1.3.2/§3 国際化/§9.2), `./README.md`, D20260527-101
> **設計判断**: 4 言語 / react-i18next / UI のみ 4 言語・法務 JA 正本 (D-101)

---

## 1. 提供インターフェース (cross-cutting)

| インターフェース | シグネチャ | 期待動作 |
|---|---|---|
| `i18n` 初期化 | `src/i18n/config.ts` が i18next instance を export、`main.tsx` で `<I18nextProvider>` ラップ | アプリ起動時にロケール検出 → カタログロード |
| 翻訳取得 | `const { t } = useTranslation()` → `t('nav.inventory')` | キーに対応する現ロケールの文字列。欠落時は ja フォールバック |
| 補間/複数 | `t('inspection.summaryCount', { count })` | i18next interpolation/plural |
| ロケール取得/設定 | `useLocale(): { locale, setLocale(l) }` | 現ロケール取得 + 切替 (localStorage 永続化 + i18n.changeLanguage) |
| 言語切替 UI | `<LanguageSwitcher />` | 4 言語ドロップダウン/メニュー。選択で即時切替 + 永続化 |
| 日付整形 | `formatDate(date, locale)` | `Intl.DateTimeFormat` でロケール整形 (期限表示) |
| 数値整形 | `formatNumber(n, locale)` | `Intl.NumberFormat` |
| enum ラベル | `categoryLabel(c, t)` / `freshnessLabel(f, t)` | DB enum 値 → ロケールラベル (現状 enum 生値表示の不具合も同時解消) |

## 2. 入出力

### 2.1 ロケール検出の優先順位
1. **localStorage の永続選択** (`bousai.locale`) があればそれ
2. なければ **ブラウザ Accept-Language** (`navigator.language`) を 4 言語にマッチ (zh-* → zh-Hans、ko-* → ko 等の正規化)
3. マッチしなければ **ja** (正本/フォールバック)

### 2.2 副作用
- localStorage 書き込み (`bousai.locale`、ロケール選択時)
- `<html lang>` 属性を現ロケールに同期 (a11y/SEO)
- DB 書き込みなし、外部呼び出しなし (純クライアント)

## 3. データモデル

DB 変更なし (UI 文字列のみ。ユーザーのロケール選択は localStorage、サーバー保存しない = MVP)。

### 3.1 カタログ構造
```
src/i18n/
  config.ts                 # i18next init + detector + resources 遅延ロード
  useLocale.ts              # ロケール取得/設定フック (localStorage 永続)
  format.ts                 # formatDate / formatNumber (Intl)
  labels.ts                 # enum → t() キーのマップ (category/freshness/reason)
  locales/
    ja.json                 # 正本 (ソース)
    en.json
    zh-Hans.json
    ko.json
```

### 3.2 キー命名規約 (ドットネスト、ドメイン別)
`common.*` / `nav.*` / `header.*` / `inventory.*` / `inspection.*` / `shopping.*` / `settings.*` / `feedback.*` / `status.*` / `category.*` / `freshness.*` / `errors.*` / `legal.*`

## 4. 文字列抽出インベントリ (ja 正本値、承認済み wording 校正 4 件反映済)

> en/zh-Hans/ko 訳は tdd Phase 2 で生成。**承認済み校正**: ★ 印。

| キー | ja 値 | 出典 |
|---|---|---|
| `header.title` | 持ち出し袋チェッカー | AppHeader (ブランド名、翻訳するが固有名詞性に注意) |
| `header.about` | このサービスについて | InfoButton aria |
| `header.aboutBody1` | 防災の持ち出し袋に入れた水・食料・電池などを登録すると、消費期限や交換目安が近づいたときにお知らせします。いざという時の「気づいたら期限切れ」を防ぐためのチェッカーです。 | 入口 O41 |
| `header.aboutBody2` | すべての機能を無料で使えます。役に立ったら 100 円の投げ銭で応援できます（任意）。 | 入口 O43 |
| `nav.inventory` | 品目 | bottom-nav |
| `nav.inspection` | 点検 | bottom-nav |
| `nav.shopping` | 買い物 | bottom-nav |
| `nav.settings` | 設定 | bottom-nav |
| `nav.aria` | メインナビ | bottom-nav aria |
| `common.add` | 追加 | 共通 |
| `common.cancel` | キャンセル | 共通 |
| `common.save` | 保存 | 共通 |
| `common.send` | 送信 | 共通 |
| `common.loading` | 読み込み中… | 共通 |
| `common.close` | 閉じる | InfoButton |
| `inventory.heading` | 品目 | InventoryScreen |
| `inventory.form.name` | 品目名 | ItemForm |
| `inventory.form.category` | 種類 ★ | ItemForm (区分→種類) |
| `inventory.form.freshnessType` | 管理のしかた ★ | ItemForm (鮮度種別→管理のしかた) |
| `inventory.form.expiresAt` | 期限 | ItemForm |
| `inventory.form.replaceMonths` | 交換の目安(月) | ItemForm |
| `inventory.form.quantity` | 数量 | Field |
| `inventory.empty` | まだ品目が登録されていません。最初の品目を追加しましょう。 | ItemList |
| `inventory.addItem` | 品目を追加 | ItemList |
| `category.water` | 水 | 新規ラベル (enum 生値表示の解消) |
| `category.food` | 食料 | 〃 |
| `category.battery` | 電池 | 〃 |
| `category.medicine` | 医薬品 | 〃 |
| `category.document` | 書類 | 〃 |
| `category.other` | その他 | 〃 |
| `freshness.expiry` | 期限で管理 | 新規ラベル |
| `freshness.replace_guide` | 交換目安で管理 | 〃 |
| `freshness.check_only` | 内容確認のみ | 〃 |
| `status.fresh` | 問題なし ★ | StatusChip (鮮度OK→問題なし) |
| `status.warn` | そろそろ点検 | StatusChip |
| `status.expired` | 交換の時期 | StatusChip |
| `inspection.empty` | 登録された品目がありません。 | InspectionChecklist |
| `inspection.allGreen` | 点検完了 — 全部グリーンです。 | 〃 |
| `inspection.recorded` | 点検を記録しました。 | 〃 |
| `inspection.complete` | 点検を完了する | 〃 |
| `shopping.generate` | 買い物リストを作る ★ | ShoppingList (リストを生成→) |
| `shopping.empty` | 買い物リストは空です。点検のあとに買い物リストを作れます。 ★ | ShoppingList (生成→作る) |
| `settings.heading` | 設定 | SettingsScreen |
| `settings.notification` | 通知 | 〃 |
| `settings.emailReminder` | 期限が近づいたらメールで知らせる | 〃 |
| `settings.leadDays` | 何日前から知らせるか | 〃 |
| `settings.support` | 開発を応援する | 〃 |
| `settings.supportBody` | すべての機能は無料で使えます。100 円の投げ銭で開発を応援できます（任意・機能は変わりません）。 | 〃 (O43) |
| `settings.tip` | 100 円で応援する | 〃 |
| `settings.feedback` | ご意見・不具合 | 〃 |
| `feedback.thanks` | ありがとうございます。 | FeedbackWidget |
| `feedback.good` | 良い | 〃 |
| `feedback.bad` | いまいち | 〃 |
| `feedback.bugContent` | 不具合の内容 | 〃 |
| `footer.privacy` | プライバシーポリシー | footer |
| `footer.terms` | 利用規約 | footer |
| `footer.tokushoho` | 投げ銭・運営者情報 | footer |
| `footer.legal` | 法務 | footer |
| `footer.tagline` | AI 駆動開発で公開している個人プロジェクトです。 | footer |
| `errors.nameRequired` | 品目名を入力してください | itemSchema |
| `errors.quantityInvalid` | 数量を確認してください | itemSchema |
| `errors.dateInvalid` | 日付を確認してください | itemSchema |
| `errors.expiresRequired` | 期限を入力してください | itemSchema |
| `errors.replaceMonthsRequired` | 交換の目安(月)を入力してください | itemSchema |
| `legal.jaAuthoritative` | この文書の正本は日本語です。 | 法務ページ (非 ja ロケール時に表示) |
| `language.label` | 言語 / Language | LanguageSwitcher aria |

> ja 値が確定したら tdd Phase 2 で en/zh-Hans/ko を生成 (design-system ボイス基準 = 淡々・穏やか)。`header.title` は固有名詞のため en では "Bousai Bag Checker" 等、各言語で自然な表記。

## 5. 機能固有 NFR + 既存機能連携

### 5.1 NFR
| 項目 | 目標 | 根拠 |
|---|---|---|
| バンドル影響 | ロケール JSON は遅延ロード (初期は検出ロケール 1 つ) | 4 言語でも初期バンドル増を最小化 |
| キー欠落 | prod で missing key を ja フォールバック (画面にキー名を出さない) | UX |
| 切替即時性 | 言語切替は即時反映 (リロード不要) | react-i18next reactive |
| a11y | `<html lang>` を同期 | スクリーンリーダ/SEO |

### 5.2 既存機能連携
- **全 UI (screens/components/features)**: ハードコード文字列を `t()` 呼び出しに置換 (被依存)。
- **_shared/ui (StatusChip/Field/Button/InfoButton)**: ラベルを t() 化。
- **_shared/legal**: JA 正本維持。非 ja ロケール時に `legal.jaAuthoritative` 注記を表示し本文は JA。
- **itemSchema (Zod)**: エラーメッセージを t() キー参照に (検証関数に t を渡すか、キーを返して表示層で t)。

## 6. タグ別追加項目 (i18n)

- **翻訳キー設計**: §3.2 命名規約。ネスト + ドメイン prefix。
- **プレースホルダ/補間**: `{{count}}` 等は i18next 形式。日付/数値は format.ts。
- **ロケール正規化**: `zh`/`zh-CN`/`zh-Hans` → `zh-Hans`、`ko-KR` → `ko`、`en-*` → `en`、その他 → `ja`。

## 7. スコープ外
- 法務長文の zh/ko/en 翻訳 (JA 正本、フォールバック)。
- サーバー側ロケール保存 (MVP は localStorage のみ、ユーザーアカウントへの保存は v2)。
- 通知メール本文の多言語化 (MVP は ja、v2 で検討 — notification は別 target)。
- RTL 言語 (対象 4 言語はいずれも LTR)。

## 8. 未決事項
- [論点-S-i18n-1] 通知メール (Resend) 本文の多言語化: MVP は ja 固定。ユーザーのロケール選択をサーバーに保存しメール言語に反映するのは v2 (notification + db 拡張が必要)。判断期限: v2 検討時。担当: seiji。
- 現時点で他の論点なし (2026-05-27)。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (4 言語 i18n、react-i18next、UI のみ・法務 JA 正本) | /flow:feature |
