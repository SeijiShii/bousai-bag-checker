// SEC-002 / 論点-005: PII マスク。Sentry beforeSend / logger / コストログ全経路で通す。
// メール / Clerk トークン / 認証 / 保管場所 / 電話 / 住所 等を除去・マスク。

const PII_KEY = /email|e-mail|token|authorization|auth|password|secret|phone|tel|address|storage[_-]?location|clerk/i;
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const REDACTED = '[REDACTED]';
const MASKED_EMAIL = '***@***';

function scrubString(s: string): string {
  return s.replace(EMAIL_RE, MASKED_EMAIL);
}

/** オブジェクト/配列/文字列を再帰的に走査し PII を除去・マスクする。 */
export function scrubPII<T>(value: T): T {
  if (typeof value === 'string') {
    return scrubString(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => scrubPII(v)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = PII_KEY.test(k) ? REDACTED : scrubPII(v);
    }
    return out as unknown as T;
  }
  return value;
}

/** Sentry の beforeSend に渡すフック。event から PII を除去してから送信。 */
export function sentryBeforeSend<E>(event: E): E {
  return scrubPII(event);
}
