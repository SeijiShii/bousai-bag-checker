# feedback 機能仕様書

> **役割**: 好き嫌い(👍/👎)+ バグ報告ウィジェット(UC5, O40)。運用品質シグナルを収集。MVP は自前 DB + 運用チャンネル通知(論点-002 案A、hub 連携は後)。
> **タグ**: feature, analytics
> **最終更新**: 2026-05-27
> **入力アーティファクト**: `../concept.md` (§1.1 UC5 / §5.1 feedback / §3.1 SEC / §8 論点-002), `../_shared/{db,ui,notification}`, `./README.md`

---

## 1. 詳細 UC（画面別フロー）

### UC5: フィードバック送信（concept §1.1 #5 由来）
- **トリガー**: フィードバックウィジェット (👍/👎 + バグ報告)
- **前提**: ゲストでも送信可 (user_id nullable)
- **入力**: type(reaction/bug)、reaction(👍/👎) or bug 本文、自動 context(route/version/UA)
- **処理**: クライアントで PII を入れない設計 → 送信前 PII scrub(O28/O40) → レート制限/bot 対策 → feedback 挿入 → 運用チャンネル通知(任意)
- **出力**: 「ありがとうございます」(O38 トーン、控えめ)
- **例外**: レート超過(429)、送信失敗(淡々と)

---

## 2. 入出力

### 2.1 API
| メソッド | パス | 入力 | 出力 | 認証 |
|---|---|---|---|---|
| POST | /api/feedback | {type, reaction?/payload, context} | 201 | **不要(ゲスト可)** + レート制限 + bot 対策 |

### 2.2 画面入力
| フィールド | 型 | 必須 | バリデーション | 説明 |
|---|---|---|---|---|
| type | enum | ✅ | reaction/bug | 種別 |
| reaction | enum | type=reaction時 | up/down | 好き嫌い |
| payload(bug本文) | text | type=bug時 | <=1000字、PII scrub | バグ内容 |
| context | auto | – | route/version/UA(PII除外) | 自動付与 |

### 2.3 副作用
- DB: feedback 挿入 (user_id nullable)。通知: 運用チャンネル(任意、notification 経由 or Webhook)。

---

## 3. データモデル
新規エンティティなし。db の `feedback` (id/user_id?/type/payload/context/created_at) を使用。payload は PII scrub 済。

---

## 4. バリデーション + エラーケース

### 4.1 バリデーション
| 対象 | ルール | エラーメッセージ |
|---|---|---|
| type | reaction/bug | – |
| payload(bug) | <=1000字 + PII scrub | 「内容を確認してください」 |
| 送信レート | IP 単位 N/min + Turnstile/honeypot | – |

### 4.2 エラーケース
| ID | 条件 | 状態 | ユーザー表示 | ログ |
|---|---|---|---|---|
| FB-E1 | レート超過/bot 判定 | 429 | 「しばらくしてからお試しください」 | – |
| FB-E2 | PII 混入検出 | – | scrub して送信 (拒否しない) | scrub 後のみ記録 (SEC-002) |
| FB-E3 | 送信失敗 | 5xx | 淡々と、リトライ | PII 非ログ |

---

## 5. 機能固有 NFR + 既存機能連携

### 5.1 機能固有 NFR
| 項目 | 目標値 | 根拠 |
|---|---|---|
| 公開エンドポイント保護 | レート制限 + bot 対策 | SEC-004 / 論点-007 (feedback 部分) |
| PII | 送信前 scrub、payload に PII を残さない | SEC-002 / O28 / O40 |
| 軽量 | ウィジェットは控えめ・非侵襲 | O40 運用シグナル、charter 非煽り |

### 5.2 既存機能連携
| 連携先 | 種別 | 依存内容 |
|---|---|---|
| _shared/db | feedback 挿入 | user_id nullable |
| _shared/ui | ウィジェット | design-system |
| _shared/notification | 運用通知(任意) | バグ報告を運用チャンネルへ |

---

## 6. タグ別追加項目

### 6.1 ログ・分析 (analytics)
- イベント: feedback_submitted (type/reaction)。**PII を含めない** (匿名集計、O26/SEC-002)。
- GA4 等は入れない (concept §6、Cookie バナー回避)。自前集計のみ。

---

## 7. スコープ外
- 中央 feedback-hub 連携 (論点-002 案A: hub 構築後。MVP は自前 DB + 運用チャンネル)。
- フィードバックへの返信機能 (MVP 外)。
- 管理画面での feedback 閲覧 UI (MVP 外、将来 admin)。

## 8. 未決事項 (論点リスト)
現時点で論点なし (2026-05-27)。concept §8 論点-002 (feedback-hub) は **案A (自前 DB + 運用チャンネル通知、hub 連携は hub 構築後)** を採用 (D-043 auto-pick 承認)。SEC-004 の feedback 部分(レート制限/bot)を本 SPEC で対応。

## 9. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (👍/👎+バグ報告 + PII scrub + レート制限/bot、論点-002 案A) | /flow:feature |
