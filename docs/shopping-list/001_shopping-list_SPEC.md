# shopping-list 機能仕様書

> **役割**: 期限切れ/不足分から買い物 TODO リストを生成し、買ったものをチェックして購入状況を管理する(UC4)。**無料機能**(D-028、課金ゲートなし)。
> **タグ**: feature, auth-required
> **最終更新**: 2026-05-27
> **入力アーティファクト**: `../concept.md` (§1.1 UC4 / §5.1 shopping_item / §3.1 SEC / §8 論点-006), `../inventory`, `../_shared/{db,ui}`, `./README.md`

---

## 1. 詳細 UC（画面別フロー）

### UC4: 買い物 TODO リスト（concept §1.1 #4 由来）
- **トリガー**: 買い物タブ / 点検後の「買い替えリスト作成」
- **前提**: ログイン/ゲスト + items
- **処理**:
  1. 期限切れ/不足の items を抽出 → shopping_item に起こす (reason=expired/insufficient)
  2. 手動追加も可 (reason=manual)
  3. 買ったものを is_bought チェック → bought_at 記録
  4. 任意で CSV エクスポート/共有 (CSV インジェクションエスケープ、SEC-003)
- **出力**: TODO リスト (未購入/購入済の区別)、CSV
- **例外**: items 0件 → EmptyState、エクスポート失敗

---

## 2. 入出力

### 2.1 API
| メソッド | パス | 入力 | 出力 | 認証 |
|---|---|---|---|---|
| GET | /api/shopping | — | 本人の shopping_item[] | requireUser (withOwner) |
| POST | /api/shopping/generate | — | 期限切れ/不足から生成 | requireUser |
| POST | /api/shopping | { name, reason } | 手動追加 | requireUser |
| PATCH | /api/shopping/:id | { is_bought } | 購入チェック更新 | requireUser (withOwner) |
| DELETE | /api/shopping/:id | id | 削除 | requireUser (withOwner) |
| GET | /api/shopping/export | — | CSV (インジェクションエスケープ) | requireUser |

### 2.2 画面入力
| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| name | text | ✅ | 1-200字 | 買うもの |
| reason | enum | ✅ | expired/insufficient/manual | 起こし理由 |
| is_bought | bool | – | – | 購入済みチェック |

### 2.3 副作用
- DB: shopping_item の CRUD (withOwner)、items 読み取り (生成時)。

---

## 3. データモデル
新規エンティティなし。db の `shopping_item` (id/user_id/item_id?/name/reason/is_bought/bought_at/created_at) を使用。**無料機能**(課金カラム参照なし、D-028)。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール | エラーメッセージ |
|---|---|---|
| name | 必須・1-200字 | 「品目名を入力してください」 |
| reason | enum | – |
| CSV エクスポート | `=`/`+`/`-`/`@` 始まりをエスケープ (SEC-003) | – |

### 4.2 エラーケース
| ID | 条件 | 状態 | 振る舞い |
|---|---|---|---|
| SL-E1 | 他人の shopping_item アクセス | 404 | withOwner (SEC-001) |
| SL-E2 | CSV インジェクション (`=cmd` 等) | – | セルを `'` プレフィックス等でエスケープ (SEC-003/論点-006) |
| SL-E3 | items 0件で生成 | – | 「対象がありません」 |
| SL-E4 | 未認証 | 401 | サインイン誘導 |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| 無料機能 | 課金ゲートなし (D-028) | 社会善アプリ、全機能無料 |
| 所有者分離 | withOwner (SEC-001) | §3.1 |
| CSV エクスポート安全 | インジェクションエスケープ (SEC-003) | 論点-006 |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| inventory | データ参照 | 期限切れ/不足 items を抽出 (freshness) |
| _shared/db | shopping_item + withOwner | CRUD |
| _shared/ui | リスト/チェック UI | design-system |

---

## 6. タグ別追加項目

### 6.1 認可 (auth-required / SEC-001)
- shopping_item は withOwner(userId) 経由。他人の id で 404 (IDOR 防止)。ゲストも自分の TODO を持てる。

---

## 7. スコープ外
- PDF 出力 (D-028 で廃止、CSV/共有のみ)。
- 課金ゲート (D-028、無料機能)。
- EC/購入リンク連携 (concept §1.2 除外、物販しない)。

## 8. 未決事項 (論点リスト)
現時点で論点なし (2026-05-27)。CSV インジェクション(SEC-003/論点-006)は本 SPEC のエクスポートエスケープで対応。課金は D-028 で無料確定。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (買い物 TODO 生成+購入管理、無料、CSV インジェクション対応) | /flow:feature |
