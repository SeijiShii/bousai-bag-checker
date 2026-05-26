# inventory 機能仕様書

> **役割**: 品目登録・編集・一覧。期限/数量/保管場所/写真を記録し、カテゴリ別の鮮度(期限/交換目安/内容確認)を管理する中核機能。
> **タグ**: feature, auth-required
> **最終更新**: 2026-05-27
> **入力アーティファクト**: `../concept.md` (§1.1 UC1 / §5.1 item / §3.1 SEC / §8 論点-001), `../_shared/{db,auth,ui}`, `./README.md`

---

## 1. 詳細 UC（画面別フロー）

### UC1: 品目一覧（concept §1.1 #1 由来）
- **トリガー**: ホーム/品目タブを開く
- **前提**: ゲスト or アカウント (withOwner で本人の品目のみ)
- **入力**: なし (一覧取得)。任意でカテゴリ/鮮度フィルタ
- **処理**: withOwner(userId).items.findMany() → 鮮度3段階(fresh/warn/expired)を算出して StatusChip 表示
- **出力**: 品目カード一覧。0件は EmptyState (SVG + 「最初の品目を追加」CTA)
- **例外**: 取得失敗 → 淡々としたエラー + リトライ

### UC2: 品目登録/編集（concept §1.1 #1 由来）
- **トリガー**: 「追加」ボタン / カード編集
- **入力**: name / category / quantity / storage_location / freshness_type / expires_at or replace_months / photo / note
- **処理**: Zod 検証 → withOwner で create/update → 写真は R2 アップロード(任意)
- **出力**: 一覧へ戻る + 反映
- **例外**: 検証エラー (Field に表示)、保存失敗 (淡々と)

### UC3: 品目削除
- **トリガー**: カード削除アクション + 確認
- **処理**: withOwner.delete(id) (id+user_id 複合、IDOR 防止)
- **出力**: 一覧から消える

---

## 2. 入出力

### 2.1 API
| メソッド | パス | 入力 | 出力 | 認証 |
|---|---|---|---|---|
| GET | /api/items | (filter?) | 本人の items[] | requireUser |
| GET | /api/items/:id | id | item | requireUser (withOwner) |
| POST | /api/items | item body | 作成 item | requireUser |
| PATCH | /api/items/:id | patch | 更新 item | requireUser (withOwner) |
| DELETE | /api/items/:id | id | 204 | requireUser (withOwner) |
| POST | /api/items/photo | file | R2 key | requireUser |

### 2.2 画面入力
| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| name | text | ✅ | 1-200字 | 品目名 |
| category | enum | ✅ | water/food/battery/medicine/document/other | 区分 |
| quantity | int | ✅ | >=0 | 数量 |
| storage_location | text | – | <=200字 | 保管場所 (本人限定) |
| freshness_type | enum | ✅ | expiry/replace_guide/check_only | 鮮度種別(論点-001 案A) |
| expires_at | date | freshness=expiry時 | 妥当な日付 | 期限 |
| replace_months | int | replace_guide時 | >=1 | 交換目安(月) |
| photo | file | – | 画像/サイズ上限 | R2 |
| note | text | – | <=500字 | メモ |

### 2.3 副作用
- DB: items への CRUD (withOwner)。外部: R2 (写真、任意)。通知: なし (inspection が cron で扱う)。

---

## 3. データモデル

### 3.1 新規エンティティ
なし (db の `items` を使用)。

### 3.2 既存エンティティへの変更
- `items` (db 設計済) をそのまま使用。論点-001 案A: `freshness_type` (expiry/replace_guide/check_only) + nullable `expires_at`/`replace_months` で 3 種を表現。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール | エラーメッセージ |
|---|---|---|
| name | 必須・1-200字 | 「品目名を入力してください」 |
| freshness_type=expiry | expires_at 必須 | 「期限を入力してください」 |
| freshness_type=replace_guide | replace_months 必須 | 「交換の目安(月)を入力してください」 |
| quantity | 非負整数 | 「数量を確認してください」 |
| 入力全般 | Zod スキーマで一元化 (SEC-003/論点-006) | 「入力を確認してください」 |

### 4.2 エラーケース
| ID | 条件 | 状態 | ユーザー表示 | ログ |
|---|---|---|---|---|
| INV-E1 | 他人の item アクセス | 404 | 「見つかりません」 | PII 非ログ (withOwner で IDOR 防止、SEC-001) |
| INV-E2 | 未認証 | 401 | サインイン誘導 | – |
| INV-E3 | 検証失敗 | 400 | Field エラー | – |
| INV-E4 | R2 アップロード失敗 | 5xx | 「写真を保存できませんでした」 | PII 非ログ |
| INV-E5 | エクスポート時 CSV インジェクション | – | (shopping-list 側で対応、SEC-003) | – |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| 品目 CRUD | < 300ms p95 | concept §3 |
| 一覧表示 | 数十〜100件で軽快 | §3 低スケール |
| 写真 | R2、サイズ上限 + 遅延ロード | §4.3 R2 無料枠 |
| 所有者分離 | 全クエリ withOwner (SEC-001) | §3.1 |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| _shared/db | items + withOwner | CRUD |
| _shared/auth | requireUser | userId 解決 |
| _shared/ui | Card/StatusChip/Field/EmptyState | 画面 |
| inspection | データ参照 | 期限抽出元 (items.expires_at) |
| shopping-list | データ参照 | 期限切れ/不足の抽出元 |

---

## 6. タグ別追加項目

### 6.1 認可 (auth-required / SEC-001)
- ロール: 本人のみ。全 items アクセスは withOwner(userId) 経由。
- 所有者チェック: findById/update/delete は id+user_id 複合 (他人の id で 404、IDOR 防止)。
- ゲストも自分の items を持てる (anonymous userId)。

---

## 7. スコープ外
- 写真からの自動登録 (OCR/Vision、v2、concept §1.2 除外)。
- 家族共有での共同編集 (v2)。
- 一括インポート/エクスポート (shopping-list が買い物 TODO で部分カバー)。

## 8. 未決事項 (論点リスト)
現時点で論点なし (2026-05-27)。concept §8 論点-001 (期限なし品目の鮮度) は **案A (3種 freshness_type) を採用** (D-043 auto-pick 承認)。db スキーマに反映済。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (品目 CRUD + 写真 + 3種 freshness[論点-001 案A] + withOwner) | /flow:feature |
