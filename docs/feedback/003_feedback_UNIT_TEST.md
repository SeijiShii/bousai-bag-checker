# feedback 単体テスト計画

> **入力**: `./001_feedback_SPEC.md`, `./002_feedback_PLAN.md`
> **最終更新**: 2026-05-27

---

## 1. テストケース一覧

### 1.1 正常系
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-N1 | POST /api/feedback | type=reaction, up | feedback 挿入 (user_id 任意) |
| U-N2 | POST /api/feedback | type=bug + 本文 | scrub 済 payload で挿入 + 運用通知(mock) |
| U-N3 | feedbackSchema | 正常入力 | 検証通過 |
| U-N4 | ゲスト送信 | 未認証 | user_id=null で挿入 |

### 1.2 異常系
| ID | 対象 | 失敗条件 | 期待振る舞い |
|---|---|---|---|
| U-E1 | POST /api/feedback | レート超過 | 429 (FB-E1) |
| U-E2 | POST /api/feedback | bot 判定 (honeypot/Turnstile失敗) | 拒否 |
| U-E3 | feedbackSchema | payload 1001字 | 検証エラー |
| U-E4 | 送信失敗 | DB/通知エラー | 5xx、PII 非ログ (SEC-002) |

### 1.3 PII scrub (SEC-002、重点)
| ID | 対象 | 入力 | 期待出力 |
|---|---|---|---|
| U-P1 | scrubPII | payload にメール混入 | メールがマスク/除去されて挿入 |
| U-P2 | context | UA/route | PII を含まない (匿名) |
| U-P3 | analytics イベント | feedback_submitted | PII を含まない |

## 2. Mock 方針
| 対象 | 方針 | 理由 |
|---|---|---|
| DB | pglite or mock | feedback 挿入 |
| notification (scrubPII/通知) | 実 scrubPII + mock 通知 | scrub は実ロジック検証、通知は mock |
| bot 対策 (Turnstile) | mock verify | no-key、成功/失敗再現 |
| レート制限 | カウンタ mock | 429 テスト |

## 3. カバレッジ目標
| 種別 | 目標 | 根拠 |
|---|---|---|
| 行 | 80% | concept 継承 |
| 分岐 | 70% | concept 継承 |
| **PII scrub (SEC-002)** | **必須** | 法令必須、payload/context/イベントに PII なし |
| レート制限/bot (SEC-004) | 必須 | 公開エンドポイント保護 |

## 4. 既存ユーティリティ依存
- db(feedback)、notification(scrubPII)。

## 5. テスト実行環境
- フレームワーク: vitest (+ testing-library for widget)
- 実行コマンド (例示): テストランナー実行

## 6. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-27 | 初版作成 (PII scrub + レート制限/bot 重点) | /flow:feature |
