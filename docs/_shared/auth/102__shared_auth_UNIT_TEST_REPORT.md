# 単体テストレポート: _shared/auth

## 実施日時
2026-05-27 (JST) / vitest 2.1.9 + pglite (mock SessionResolver, no-key)

## テスト結果
| # | テストケース | 結果 |
|---|---|---|
| U-N1 | getOrCreateUser 新規作成 | ✅ |
| U-N2 | getOrCreateUser 既存は同一 id (重複なし) | ✅ |
| U-N6 (O22) | 同一 clerk_user_id でゲスト→permanent 同一行 | ✅ |
| U-N3 | 認証済 → 内部 user.id | ✅ |
| U-B1 | 未認証 → null | ✅ |
| U-N5/E1 | requireUser 認証済=id / 未認証=401 | ✅ |
| U-E5 (SEC-001) | req の user_id を無視、resolver 値のみ | ✅ |

## サマリー
| 計画 | 追加 | 合計 | 成功 | 成功率 |
|---|---|---|---|---|
| 7 | 0 | 7 | 7 | 100% |

> userId 信用線 (SEC-001) を 100% カバー (req 偽装無視 + 401)。実 Clerk 結合は release の sandbox/実キーで確認。
