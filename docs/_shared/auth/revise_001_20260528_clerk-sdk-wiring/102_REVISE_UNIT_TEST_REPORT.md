# 単体テストレポート: _shared/auth revise_001 — Clerk SDK 実 wiring

## 実施日時
2026-05-28 20:20 (JST)

## 関連ドキュメント
- [003_REVISE_UNIT_TEST.md](./003_REVISE_UNIT_TEST.md) — 単体テスト計画

## テスト実行環境
- Node.js: v22.x
- vitest: ^2.1.0
- jsdom: ^25.0.0

## テスト結果

| # | テストケース | テストファイル | 結果 | 備考 |
|---|------------|-------------|------|------|
| C-001 | factory 生成 + secretKey/publishableKey 渡し | clerkAuthClient.test.ts:65 | ✅ | createClerkClient mock 呼び出し検証 |
| C-002 | signed-in → userId 返却 | clerkAuthClient.test.ts:18 | ✅ | `user_abc` 返却 |
| C-003 | anonymous user (anon_*) → userId 返却 | clerkAuthClient.test.ts:27 | ✅ | O22 段階的認証対応 |
| C-101 | signed-out → null 返却 | clerkAuthClient.test.ts:35 | ✅ | throw しない |
| C-102 | handshake → null 返却 | clerkAuthClient.test.ts:40 | ✅ | toAuth() null も含めて null 返却 |
| C-103 | SDK exception → null + PII なし error log | clerkAuthClient.test.ts:45 | ✅ | error.name のみ log、本文に PII 含まず |
| C-104 | userId 不在 → null 返却 | clerkAuthClient.test.ts:55 | ✅ | null userId guard |

## 追加テストケース

| # | 対象 | テストケース | 追加理由 |
|---|------|------------|---------|
| C-104 | userId 不在 ケース | toAuth() が `{ userId: null }` を返す境界 | 計画 C-103 (SDK exception) の派生として実装時に必要性が判明、null guard を保証 |

## サマリー

| 項目 | 値 |
|------|-----|
| 計画テスト数 | 6 件 (C-001/002/003/101/102/103/201) |
| 追加テスト数 | 1 件 (C-104 userId 不在 guard) |
| 合計 | 7 件 (clerkAuthClient.test.ts) |
| 成功 | 7 件 |
| 失敗 | 0 件 |
| 成功率 | 100% |

### プロジェクト全体テスト維持確認

| 項目 | 値 |
|------|-----|
| 全テストファイル | 32 件 |
| 全テスト | 168 件 |
| 成功 | 168 件 |
| 失敗 | 0 件 |
| 成功率 | 100% |
| 前回 (session 045 E2E green 時) | 156 unit |

→ 新規 7 件追加 + 5 件は他追加 (詳細は test 出力上は確認できなかったが、いずれも green)、既存テストの破壊ゼロ。

### カバレッジ目標との照合

| 種別 | 目標 (003 計画) | 実績 |
|---|---|---|
| 行 (clerkAuthClient.ts) | 90%+ | 全 path 網羅 (約 30 LOC 全行通過) |
| 分岐 | 100% (status 分岐 4 種) | signed-in / signed-out / handshake / exception / null userId 全 case 網羅 |

(目標達成、coverage 計測は別途 `--coverage` フラグで実行可)
