# _shared/notification 変更仕様書 (Resend SDK 実 wiring)

> **改修種別**: 拡張 (release seam 完成、auth/billing と同形 pattern)
> **issue / slug**: 001 / resend-sdk-wiring
> **基準 SPEC**: `../001__shared_notification_SPEC.md`
> **最終更新**: 2026-05-28
> **タグ**: notification / Resend / O35 inject seam

## 1. 変更概要

`EmailSender` interface は完成済 (`makeNotification.ts`)、`composition.ts` で sender 注入 (`makeApiCore` の sender 引数) が release 待ち。本改修で **`resend` SDK を使う `makeResendSender` factory を実装**し composition で注入する。これにより期限通知メール (notification) が実稼働可能に。

## 2. 変更前 vs 変更後

### 2.1 UC 変更
| UC ID | 変更前 | 変更後 |
|---|---|---|
| sender.send | sender 未注入で動作不可 | Resend API 経由でメール送信 |

### 2.2 入出力変更
| 対象 | 変更前 | 変更後 | 互換性 |
|---|---|---|---|
| composition.ts sender 注入 | コメント | `makeResendSender({ apiKey, from })` invoke | 完全互換 (EmailSender interface 不変) |

### 2.3 データモデル変更
不要 (emailDeliveries テーブル既存)。

### 2.4 バリデーション・エラー
- Resend API 失敗時: throw して呼び出し元 (notification scheduler) で catch + emailDeliveries に failure 記録 (既存実装の責務、本 revise scope 外)

## 3. 影響範囲

| 対象 | 影響度 | 説明 |
|---|---|---|
| `src/services/notification/resendSender.ts` (新規) | 高 | factory + Resend SDK adapter |
| `src/services/notification/resendSender.test.ts` (新規) | 高 | mock Resend client での unit test |
| `api/_lib/composition.ts` | 中 | sender 注入 1 箇所追加 |
| `package.json` | 低 | `resend` deps 追加 |

<!-- 注: auth + billing 完了後の最後の同形 revise、composition.ts のすべての SDK seam が完成 -->

## 4. 後方互換性
- **互換維持**: ✅ (EmailSender interface 不変)

## 5. ロールバック方針
- **コード revert で戻せる**: ✅ (1 commit = resendSender.ts + composition.ts)

## 6. リリース戦略
- **方式**: 一括 (seam 注入のみ)
- **検証**: Resend API key (test/dev は共通アカウント、live/test 区別なし) を `.env.development.local` に設定 → ローカルで 1 件送信テスト → preview deploy → production 同一キーで稼働

## 7. 詳細仕様 (新仕様)

### 7.1 `makeResendSender` factory

```typescript
import { Resend } from 'resend';
import type { EmailSender } from './makeNotification'; // or 移動先

export interface ResendConfig {
  apiKey: string;        // RESEND_API_KEY
  fromAddress: string;   // 送信元 e.g. "持ち出し袋チェッカー <noreply@bousai.example.com>"
}

export function makeResendSender(config: ResendConfig): EmailSender {
  const resend = new Resend(config.apiKey);
  return {
    async send(userId, template, data) {
      // template / data から件名・本文を組み立て (TemplateRenderer は別途、本 revise scope 外で簡略)
      // ここでは userId → email 解決は呼び出し元 (notification scheduler) で済んでいる前提で
      // data.to に宛先 email、data.subject に件名、data.html に本文 HTML を期待
      const to = (data.to as string) ?? '';
      const subject = (data.subject as string) ?? '(no subject)';
      const html = (data.html as string) ?? '';
      if (!to) throw new Error('resendSender: data.to is required');

      const result = await resend.emails.send({
        from: config.fromAddress,
        to,
        subject,
        html,
        // tags: [{ name: 'template', value: template }, { name: 'userId', value: userId }],
      });
      if (result.error) {
        // SEC-002: PII (email アドレス本文) は出さず、code/name のみ
        throw new Error(`Resend send failed: ${result.error.name ?? 'unknown'}`);
      }
    },
  };
}
```

### 7.2 env 要件

| env var | 必須 | 値の prefix | source |
|---|---|---|---|
| `RESEND_API_KEY` | 必須 | `re_*` | Resend dashboard → API keys |
| `RESEND_FROM_ADDRESS` | 必須 | `"Name <noreply@verified-domain.com>"` | 検証済みドメイン要 (Resend dashboard) |

### 7.3 composition.ts 改修

```typescript
import { makeResendSender } from "../../src/services/notification/resendSender";
import type { EmailSender } from "../../src/services/notification/makeNotification";

function getSender(): EmailSender | undefined {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM_ADDRESS;
  if (!apiKey || !fromAddress) return undefined;
  return makeResendSender({ apiKey, fromAddress });
}

// composition() 内:
core: makeApiCore(db, { gateway: getGateway(), sender: getSender() }),
```

## 8. 未決事項
- 現時点で論点なし (2026-05-28)。EmailSender の `template` / `data` 渡し方は既存 makeNotification 側責務に従う。

## 9. 更新履歴
| 2026-05-28 | 初版 | /flow:revise |
