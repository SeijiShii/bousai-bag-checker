# _shared/notification 実装計画書 (横断基盤)

> **入力**: `./001__shared_notification_SPEC.md`, `../../concept.md` §1.4 / §4.3 / §4.6 / §6
> **最終更新**: 2026-05-26

---

## 1. 実装対象ファイル一覧

| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/services/notification/notificationClient.ts` | **NotificationClient interface** | — | 40 |
| `src/services/notification/resendEmailClient.ts` | 実装版 (Resend SDK 注入) + テンプレート | resend, db | 110 |
| `src/services/notification/inApp.ts` | createInApp/listInApp/markRead (withOwner) | db | 70 |
| `src/services/notification/settings.ts` | get/updateSettings (withOwner) | db | 50 |
| `src/services/notification/pii.ts` | scrubPII + sentryBeforeSend + logger ラッパ (SEC-002) | — | 80 |
| `src/db/schema.ts` (拡張) | notifications / email_deliveries テーブル追加 | db | 50 |
| `src/services/notification/index.ts` | 公開エクスポート | 上記 | 15 |

## 2. 実装 Phase 分割 (/flow:tdd 連携、injectable + interface default = O35)

### Phase 1 (RED→GREEN→IMPROVE): PII マスク (SEC-002、最優先)
- 対象: `pii.ts` (scrubPII / sentryBeforeSend / logger ラッパ)
- テスト対象: メール/トークン/品目名/保管場所が event・log から除去/マスクされる
- ゴール: PII が外部 (Sentry/log) に出ない (法令必須、論点-005)

### Phase 2: settings + inApp (withOwner、mock db)
- 対象: `settings.ts` + `inApp.ts` + schema 拡張 (notifications/email_deliveries)
- テスト対象: 購読 get/update が本人のみ (withOwner)、in-app 作成/既読、他人拒否
- ゴール: user-scoped 通知操作が所有者強制で通る

### Phase 3: NotificationClient interface + 送信ロジック (mock Resend)
- 対象: `notificationClient.ts` interface + sendEmail の購読確認/quiet_hours/skip ロジック (mock 送信注入)
- テスト対象: 購読 OFF/quiet で skipped、ON で sent 記録、失敗で failed + リトライ
- ゴール: 送信判定ロジックが mock で通る

### Phase 3.5: app/api bootstrap (SDK 統合、O35)
- 対象: `resendEmailClient.ts` (実 Resend Inject) + Sentry 初期化に sentryBeforeSend 配線
- `.env.example` に `RESEND_API_KEY` / `SENTRY_DSN` 追記 (実キー書かない、サーバー専用)
- ゴール: sandbox (dev/mock) で送信 + Sentry PII マスクが効く

## 3. 依存関係順序
```
pii.ts (SEC-002) → settings/inApp (withOwner) → notificationClient interface
  → resendEmailClient (実装) + Sentry beforeSend 配線
db schema 拡張 (notifications/email_deliveries)
```
依存先: _shared/db (設計済)。

## 4. 既存ファイルへの影響
- `src/db/schema.ts` に notifications / email_deliveries を追加 (db 基盤の拡張、withOwner 対象に notifications を追加)。

## 5. 横断フォルダへの追加・変更
| 横断フォルダ | 追加・変更内容 |
|---|---|
| _shared/db | notifications / email_deliveries テーブル追加、withOwner に notifications を含める |
| (監視) | Sentry 初期化に sentryBeforeSend を適用 (SEC-002) |

## 6. リスク・注意点
- **SEC-002 (法令必須)**: PII マスクを Phase 1 で最優先実装。Sentry/log/コストログ全経路で scrubPII を通す。漏れると個人情報保護法の報告義務リスク。
- **Resend SECRET の VITE_ 露出禁止** (SEC-005)。
- **コスト連動** (§4.6): email_deliveries で送信数を自前ログ、無料枠超過予測でアラート + 縮退。
- 通知トーンの O38 準拠 (テンプレート文言、/flow:wording で仕上げ)。

## 7. 完了の定義 (DoD)
- [ ] scrubPII / sentryBeforeSend が PII を除去 (SEC-002、論点-005 実装)
- [ ] settings/inApp が withOwner で本人のみ (SEC-001)
- [ ] sendEmail が購読確認/quiet_hours/skip/failed を正しく処理
- [ ] notifications/email_deliveries を db schema に追加
- [ ] 実 Resend Inject + Sentry beforeSend が sandbox で動作
- [ ] 単体テストカバレッジ 80%/70% (PII マスクは重点)
- [ ] 統合は機能側 (inspection) E2E でカバー

## 8. 更新履歴
| 日付 | 変更概要 | 実行者 |
|---|---|---|
| 2026-05-26 | 初版作成 (PII マスク最優先 + 送信/購読/in-app の 4 Phase) | /flow:feature |
