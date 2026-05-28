import { createClerkClient } from '@clerk/backend';
import type { SessionResolver } from './authClient';

/**
 * Clerk SDK 注入用 factory (release seam の実装、O35)。
 * release Phase 1 で composition.ts から呼ばれ、makeAuth に注入される。
 * keyless テストは clerkAuthClient.test.ts で @clerk/backend を mock する。
 */
export interface ClerkConfig {
  secretKey: string;
  publishableKey?: string;
}

export function makeClerkSessionResolver(config: ClerkConfig): SessionResolver {
  const clerk = createClerkClient({
    secretKey: config.secretKey,
    publishableKey: config.publishableKey,
  });

  return {
    async resolveClerkUserId(req: unknown): Promise<string | null> {
      // <!-- spec-review R1: req は { headers, url, method } の Web Request minimum subset を満たす形式で
      //      clerk.authenticateRequest に渡す。Vercel ApiReq は標準で同形式を満たす。 -->
      try {
        const state = await clerk.authenticateRequest(req as Request);
        if (state.status === 'signed-in') {
          const auth = state.toAuth();
          const userId = auth?.userId ?? null;
          return userId ? userId : null;
        }
        return null;
      } catch (e) {
        // SEC-002: PII を含むエラー本文は出さず、name のみ記録
        // eslint-disable-next-line no-console
        console.error('[clerkAuthClient] authenticateRequest failed:', (e as Error)?.name ?? 'unknown');
        return null;
      }
    },
  };
}
