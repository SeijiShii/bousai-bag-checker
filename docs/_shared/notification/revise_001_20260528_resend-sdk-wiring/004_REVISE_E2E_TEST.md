# _shared/notification E2E テスト計画 (Resend SDK 実 wiring)

## 1. 変更 UC シナリオ
| ID | 前提 | 操作 | 期待結果 |
|---|---|---|---|
| E-001 | RESEND_API_KEY + verified from address 設定 | notification scheduler が send 呼び出し | 実 email 送信、Resend dashboard で受信ログ確認可 |
| E-002 | 受信側 inbox で件名 + 本文確認 | 期限通知メール | template 通りの内容 (i18n 対応含む) |

## 2. リグレッションシナリオ
- memory mode 既存 18 ジャーニー: notification 経路は memory backend 内で no-op、影響なし
- 全 177 unit tests: sender 注入後も全 green 維持

## 3. 移行検証シナリオ
(なし)

## 4. 環境要件差分
| 項目 | 前回 | 今回 |
|---|---|---|
| Resend account | 不要 | 必須 (free tier 3000通/月) |
| RESEND_API_KEY env | 未設定可 | 必須 (試送信時) |
| Verified domain | 不要 | **必須** (DNS 設定: SPF/DKIM/DMARC) — release Phase 1 で取得 |

## 5. 期待 KPI
- 既存 unit + E2E green 維持
- 新 E-001/002 は **release Phase 2** で実送信スモーク

## 6. 実行タイミング
- **ローカル headless (Class A)**: 既存 unit pattern で resendSender mock テスト
- **実 API key 試送信 (Class A、release Phase 2)**: 1 通だけ実送信 (Resend free tier 内)
- **production**: release Phase 3 後の本稼働確認

## 7. 更新履歴
| 2026-05-28 | 初版 | /flow:revise |
