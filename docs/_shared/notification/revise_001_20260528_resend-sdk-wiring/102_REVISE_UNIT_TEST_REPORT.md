# 単体テストレポート: _shared/notification revise_001 — Resend SDK 実 wiring

## 実施日時
2026-05-28 20:55 (JST)

## テスト結果

| # | テスト | 結果 |
|---|---|---|
| N-001 | send 成功 → resolve | ✅ |
| N-002 | factory が apiKey で Resend 初期化 | ✅ |
| N-101 | API error 返却 → throw (PII なし、name のみ) | ✅ |
| N-102 | data.to 空 → throw 'data.to is required' | ✅ |
| N-201 | subject 不在 → "(no subject)" で送信 | ✅ |

## サマリー

| 項目 | 値 |
|---|---|
| 計画 | 5 |
| 追加 | 0 |
| 成功 | 5 |
| 失敗 | 0 |
| 成功率 | 100% |

### プロジェクト全体
- 34 ファイル / **182 tests pass** (177 → +5)
- 既存破壊ゼロ
