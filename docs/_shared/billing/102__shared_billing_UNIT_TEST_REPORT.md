# 単体テストレポート: _shared/billing

## 実施日時
2026-05-27 (JST) / vitest 2.1.9 + pglite (PaymentGateway mock, no-key)

## テスト結果
| # | テストケース | 結果 |
|---|---|---|
| U-N4/E3 | createTipCheckout 常に100円(クライアント値無視) | ✅ |
| U-E1 | webhook 署名検証失敗 → invalid、donation なし | ✅ |
| U-N1/N3 | 検証成功 → donation 記録(ゲスト null) | ✅ |
| U-E2 | 二重 webhook → duplicate(1件、冪等) | ✅ |
| U-P1 (D-028) | 投げ銭で plan/権限変わらない(アンロックなし) | ✅ |
| — | getTipTotal 累計(PII なし) | ✅ |

## サマリー
| 計画 | 追加 | 合計 | 成功 | 成功率 |
|---|---|---|---|---|
| 6 | 0 | 6 | 6 | 100% |

> 署名検証 + 冪等 + 機能アンロックしないこと(D-028)を重点カバー。実課金スモークは release B-4。
