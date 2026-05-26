<!-- auto-generated-start -->
# 設計レビューレポート — inventory

**レビュー日**: 2026-05-27
**レビュー実施者**: Claude (Opus 4.7) + seiji
**対象**: inventory (機能、初の feature)
**入力**: docs/inventory/001-004 + concept.md + _shared/{db,auth,ui} SPEC
**観点ソース**: 組み込みチェックリスト + ~/.claude/review-perspectives.md (P1-P9)
**モード**: auto-pick
**severity-threshold**: low
**前提**: greenfield (実装コード src/ なし) → 「影響範囲(既存呼び出し元)」「既存パターン整合」は N/A。代わりに**設計間の整合・再利用・責務分担**(他機能が inventory を参照する契約)を中核にレビュー。

## 1. レビューサマリー

| 観点 | 評価 | 備考 |
|------|------|------|
| 仕様の明確性 | OK | UC/API/データモデル/検証/NFR 揃い |
| 既存パターンとの一貫性 | N/A (greenfield) | CRUD パターンは後続 feature の規範になる |
| API 設計 | OK | RESTful /api/items、withOwner 経由 |
| エラーハンドリング | OK | 401/404(IDOR)/400/5xx 定義 |
| テストカバレッジ | OK | freshness 3種×3段階 + 所有者分離100% + E2E L1/L2 |
| 影響範囲・副作用 | N/A→設計整合 | inspection/shopping-list が items/freshness を参照 (下記 R1) |
| API 流用・責務逸脱 | OK | freshness の所有者=inventory、他は import (R1) |
| 既存実装の再利用 | 要確認→確定 | freshness/itemSchema を共有ヘルパ化 (R1/R2) |
| データ移行・互換性 | OK | greenfield、論点-001 案A を schema に内包済 |
| 権限・認可 | OK | withOwner(SEC-001)、ゲストも自分の items |

## 2. 指摘事項 (severity 降順)

### [R1] freshness 算出を単一の共有ヘルパに固定 (severity=Medium, P2)
- **対象**: 002_PLAN `freshness.ts` / inspection `dueItems.ts` / shopping-list `generate.ts`
- **問題**: 鮮度算出 (freshness_type → fresh/warn/expired) を inspection・shopping-list も使う。各機能で再実装すると P2 (重複) のリスク。
- **推奨**: **inventory の `src/features/inventory/freshness.ts` を唯一の所有者**とし、inspection/shopping-list は import する (重複実装禁止)。PLAN にその旨明記。
- **種別**: 指摘事項 (自動反映)
- **chosen**: inventory が freshness の単一所有者、他機能は import (重複禁止)
- **反映先**: 001 §5.2 / 002 §6 にコメント付与

### [R2] itemSchema (Zod) を API/フォーム/参照機能で単一定義 (severity=Low, 再利用)
- **問題**: 入力検証スキーマを API とフォームで二重定義すると drift。
- **推奨**: `itemSchema.ts` を単一ソースとし API + フォームが共有 (PLAN 済)。category/freshness_type の enum は db `enums.ts` と一致させる (二重定義回避)。
- **chosen**: itemSchema 単一ソース + enum は db/enums.ts 由来
- **反映先**: 002 §1 にコメント

### [R3] 写真アップロード方式: サーバープロキシ採用 (severity=Medium, 設計判断)
- **問題**: R2 写真アップロードを (A) サーバープロキシ (/api/items/photo) か (B) クライアント presigned URL か。
- **選択肢**: A) サーバー経由 — シンプル・R2 鍵をクライアント露出しない(SEC-005)・無料枠の小さい画像に十分 / B) presigned — 帯域節約だが鍵運用と CORS が増える
- **推奨**: **A) サーバープロキシ** (MVP の小画像・低頻度に十分、SEC-005 整合、実装シンプル)。大容量・高頻度になれば revise で presigned 検討。
- **chosen**: A) サーバープロキシ (/api/items/photo)
- **反映先**: 001 §2.1 (既に記載) + 002 にコメント

### [R4] 一覧の鮮度色分け閾値を notification.lead_days と連動 (severity=Low, 設計判断)
- **問題**: 一覧の warn 判定閾値を inventory 固有固定値にするか、notification_settings.lead_days と連動させるか。
- **推奨**: **lead_days 連動** — 「期限が近い」の定義を通知と一覧で一致させ、ユーザー体験の一貫性を保つ (freshness.ts が lead_days を引数に取る)。
- **chosen**: lead_days 連動 (freshness.ts の引数に lead_days)
- **反映先**: 003 U-N1 が lead_days=14 前提で整合済

### [R5] CRUD パターンが後続 feature の規範になる (severity=Info)
- inventory の repository(withOwner)/api(requireUser)/Zod/エラー設計は **feedback/inspection/shopping-list の規範**。整合を保つ (P2/P3 の予防)。

## 3. コードベース調査結果

### 3.1 既存パターン
- greenfield (src/ なし)。inventory が CRUD/withOwner/Zod の**初の実装規範**になる。

### 3.2 影響範囲分析
| 変更対象 | 既存呼び出し箇所 | 契約 | 破壊リスク |
|---|---|---|---|
| items テーブル / freshness | (greenfield、なし) | inspection/shopping-list が今後 import | なし (新規) |

→ 既存破壊リスクなし。ただし **下流 (inspection/shopping-list) が freshness/items に依存する契約**を R1 で固定。

### 3.3 API 責務の評価
- freshness の責務は inventory に所属。inspection (期限抽出) / shopping-list (不足抽出) は inventory の freshness を**読み取り利用**(責務逸脱なし)。

## 4. 設計判断ログ

| # | 判断項目 | 結論 | chosen_type | 反映先 |
|---|---|---|---|---|
| D1 (R1) | freshness の所有者 | inventory 単一所有、他は import | auto-recommended | 001/002 |
| D2 (R2) | itemSchema 重複回避 | 単一ソース + enum は db 由来 | auto-recommended | 002 |
| D3 (R3) | 写真アップロード | サーバープロキシ | auto-recommended | 001/002 |
| D4 (R4) | 鮮度閾値 | lead_days 連動 | auto-recommended | 003 |

## 5. 次のステップ
- 反映済み 001-004 を確認
- `/flow:tdd inventory` で実装着手 (Phase 1: freshness/itemSchema から)
<!-- auto-generated-end -->
