// 公開エンドポイント共通のレート制限 (spec-review R1: feedback/tip/service-info で共有、P2 重複回避)。
// injectable (O35): dev/test は InMemory、prod は Upstash 等を注入。

export interface RateLimiter {
  /** key (IP/トークン単位) が許容内なら true、超過なら false。 */
  allow(key: string): Promise<boolean>;
}

/** 固定ウィンドウのインメモリ実装 (テスト/単一プロセス dev 用、no-key)。 */
export class InMemoryRateLimiter implements RateLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();
  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  async allow(key: string): Promise<boolean> {
    const t = this.now();
    const entry = this.hits.get(key);
    if (!entry || t >= entry.resetAt) {
      this.hits.set(key, { count: 1, resetAt: t + this.windowMs });
      return true;
    }
    if (entry.count >= this.limit) return false;
    entry.count += 1;
    return true;
  }
}

/** 常に許可する no-op (rate limit を一時無効化したいテスト等)。 */
export const allowAllRateLimiter: RateLimiter = { allow: async () => true };
