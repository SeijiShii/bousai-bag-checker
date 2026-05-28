# _shared/service-info E2E テスト計画 (O48 ServiceHUB 2026-05-28 契約改訂への retrofit)

> **入力**: `./001_REVISE_SPEC.md`, `../../concept.md` §1.1, 既存 service-info の E2E は **無し** (横断 _shared/* は機能側 E2E に統合)
> **最終更新**: 2026-05-28

---

## 1. 変更 UC シナリオ

### UC1: HUB が新 endpoint で service-info を pull する (curl 相当)

| シナリオ ID | 前提 | 操作ステップ | 期待結果 |
|---|---|---|---|
| E-NEW-1 | dev server 起動 + `HUB_SERVICE_INFO_SECRET=<value>` 設定 + users 表に複数件 (内 N 件は直近 30 日 updated) | `curl -H "Authorization: Bearer <value>" http://localhost:5173/api/hub/service-info` | 200 + body が新 shape (`schemaVersion:1`, `metrics[]` に `mau`/`users_total`/`error_count_24h` 含む) |
| E-NEW-2 | 同上 + token 不一致 | `curl -H "Authorization: Bearer wrong" .../api/hub/service-info` | 401 |
| E-NEW-3 | 同上 + 旧 URL | `curl -H "Authorization: Bearer <value>" .../api/service-info` | **410 Gone** + body=`{error:"deprecated", moved_to:"/api/hub/service-info"}` |

> 重い網羅 Playwright E2E は実装しない (curl ベースのスモークで十分、Backend Function のため UI を介さない)。E2E gate (P4.5) は本 revise の対象外として scope 外扱い (`004_*_E2E_TEST.md` に「scope 外」を明記)。

## 2. リグレッションシナリオ (既存 UC、重要度高)

| UC | シナリオ ID | 確認観点 |
|---|---|---|
| 全アプリ画面 (UC1-5) | E-REG-1 | dev server で各画面正常起動 (service-info 変更が他機能に波及しないこと、grep + smoke) |
| inventory CRUD | E-REG-2 | items API 200、auth middleware の touch ロジック追加 (論点-001 案 A 採用時) で `users.updated_at` 更新が他機能に副作用を与えないこと |
| 4 言語切替 | E-REG-3 | i18n テストは影響なし、念のため curl + Playwright で念押し |

## 3. 移行検証シナリオ (DB マイグレーションなし)

DB スキーマ変更なしのため不要。env rename + endpoint move のみ。

## 4. 環境要件差分

| 項目 | 前回 | 今回 | 理由 |
|---|---|---|---|
| env 必須 | `SERVICE_INFO_TOKEN` | `HUB_SERVICE_INFO_SECRET` | rename |
| ローカル dev | `http://localhost:5173/api/service-info` | `http://localhost:5173/api/hub/service-info` | path 移動 |
| 本番 (HUB pull) | `https://<url>/api/service-info` (旧) | `https://<url>/api/hub/service-info` (新) | HUB 側 registry 更新で対応 |

## 5. 期待 KPI

| 指標 | 目標 |
|---|---|
| 新 endpoint レスポンス時間 (p95) | < 500ms (DB 集計クエリ含む、low-traffic 段階) |
| 旧 endpoint 410 応答 | < 50ms (静的 stub) |
| MAU 算出 SQL | < 100ms (users 〜1000 件想定) |

## 6. 更新履歴

| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-28 | 初版作成 | /flow:revise |
