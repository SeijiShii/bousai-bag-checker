# _shared/notification 変更計画書 (Resend SDK 実 wiring)

## 1. 既存ファイル変更一覧
| ファイル | 変更内容 | リスク | 関連 SPEC § |
|---|---|---|---|
| `api/_lib/composition.ts` | sender 注入を `getSender()` 経由で追加 | 低 | §2.2, §7.3 |

## 2. 新規ファイル一覧
| ファイル | 責務 | 依存 | LOC 見積 |
|---|---|---|---|
| `src/services/notification/resendSender.ts` | `makeResendSender(config)` factory | `resend` | ~30 |
| `src/services/notification/resendSender.test.ts` | mock Resend で unit テスト | vitest + vi.hoisted | ~70 |

## 3. 削除ファイル一覧
(なし)

## 4. マイグレーション要否
- すべて ❌ → MIGRATION 不要

## 5. 実装 Phase 分割

### Phase 1: `resend` インストール
- `npm install resend`
- バージョン: `^4.x.x` (現行安定版、ESM 対応)

### Phase 2: `resendSender.ts` 実装 (TDD)
- RED: resendSender.test.ts (mock Resend、send 成功/失敗/data.to 不在ケース)
- GREEN: factory 実装
- IMPROVE: PII-safe error log (error.name のみ)

### Phase 3: `composition.ts` sender 注入
- `getSender()` 関数追加 (env 未設定なら undefined)
- `makeApiCore(db, { gateway: getGateway(), sender: getSender() })` に変更

### Phase 4: 全テスト維持確認
- typecheck pass / 177+ tests green

## 6. 依存関係順序
Phase 1 → 2 → 3 → 4

## 7. ロールアウト計画
| ステップ | 内容 | 期日 | 検証 |
|---|---|---|---|
| 1 | 実装 + unit green | 2026-05-28 | npm test |
| 2 | Resend API key + verified from address を .env.development.local | release Phase 1 | env 確認 |
| 3 | ローカル送信スモーク (1 件) | release Phase 2 | 受信確認 |
| 4 | preview/production deploy | release Phase 3 | 公開 URL で実送信 |

## 8. リスク・注意点
- Resend は from address に **verified domain** 必須 (DNS 設定が必要)
- PII (email address) を log に出さない (SEC-002)
- 送信失敗時の retry は呼び出し元 (notification scheduler) の責務、本 sender は throw のみ

## 9. DoD
- [ ] resendSender.ts + test 追加
- [ ] composition.ts に getSender() 追加
- [ ] typecheck + 全 tests green
- [ ] `resend` deps 追加

## 10. 更新履歴
| 2026-05-28 | 初版 | /flow:revise |
