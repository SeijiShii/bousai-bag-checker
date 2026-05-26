# _shared/notification 単体テスト計画 (横断基盤)

> **入力**: `./001__shared_notification_SPEC.md`, `./002__shared_notification_PLAN.md`
> **最終更新**: 2026-05-26

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | sendEmail | 購読 ON + quiet 外 | Resend 送信(mock) + email_deliveries status=sent |
| U-N2 | sendEmail | 購読 OFF | 送信せず status=skipped |
| U-N3 | sendEmail | quiet_hours 内 | 送信せず status=skipped |
| U-N4 | createInApp | userId+type | notifications 行作成 (withOwner) |
| U-N5 | markRead | 自分の通知 | read_at 更新 |
| U-N6 | updateSettings | lead_days=7 | 本人の settings 更新 (withOwner) |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | Resend 送信失敗 (mock) | API エラー | status=failed + リトライ、**PII 非ログ** (SEC-002) |
| U-E2 | markRead/updateSettings | 他人の id | withOwner で 0 行 (SEC-001) |
| U-E3 | lead_days | 0 / 91 / 負数 | バリデーションエラー |

### 1.3 PII マスク (SEC-002、最重点)
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-P1 | scrubPII | `{email:"a@b.com"}` | マスク (例 `***@***`) |
| U-P2 | scrubPII | Clerk トークン文字列 | 除去/マスク |
| U-P3 | scrubPII | リクエストボディ (品目名/保管場所) | 除去/マスク |
| U-P4 | sentryBeforeSend | PII を含む event | scrub 後の event を返す (PII なし) |
| U-P5 | logger ラッパ | PII を含むログ | 出力に PII が含まれない |

## 2. Mock 方針

| 対象 | 方針 | 理由 |
|---|---|---|
| Resend SDK | **EmailSender interface を mock 注入** | 実送信せず sent/failed を再現 (no-key) |
| DB | pglite or mock | settings/notifications/email_deliveries の制約検証 |
| Sentry | beforeSend を直接呼んで検証 | 実送信不要、scrub 結果を assert |
| 時刻 (quiet_hours 判定) | 固定値注入 | 再現性 |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行カバレッジ | 80% | concept 継承 |
| 分岐カバレッジ | 70% | concept 継承 |
| **PII マスク (SEC-002)** | **100%** | 法令必須、全 PII 種別 (email/token/品目名/保管場所) を網羅 |
| **所有者分離 (SEC-001)** | settings/inApp で必須 | cross-tenant 防止 |

## 4. 既存ユーティリティ依存
- `_shared/db` の notification_settings + 拡張 (notifications/email_deliveries) + withOwner。

## 5. テスト実行環境
- フレームワーク: vitest
- Resend: EmailSender mock (no-key)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (PII マスク SEC-002 を 100% カバー、購読/送信/所有者分離) | /flow:feature |
