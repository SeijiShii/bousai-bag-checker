// 認証基盤の interface (injectable + mock パターン、O35)。実 Clerk は clerkAuthClient で注入。

/** セッション解決の抽象 (実装は Clerk、テストは mock)。Clerk userId or null (未確立) を返す。 */
export interface SessionResolver {
  /** 検証済みセッションから Clerk userId を解決。未認証(完全未確立)なら null。 */
  resolveClerkUserId(req: unknown): Promise<string | null>;
}

export interface AuthClient {
  /** Clerk セッションから内部 user.id を解決 (ゲスト anonymous 含む)。完全未確立は null。 */
  getAuthUserId(req: unknown): Promise<string | null>;
  /** 認証必須エンドポイント用。確立済 user.id を返す、無ければ 401 (UnauthorizedError)。 */
  requireUser(req: unknown): Promise<string>;
  /** Clerk userId に対応する users 行を upsert し内部 id を返す。 */
  getOrCreateUser(clerkUserId: string): Promise<string>;
}

/** 認証必須 EP で未確立時に投げる (機能側で 401 にマップ)。PII を含めない (SEC-002)。 */
export class UnauthorizedError extends Error {
  readonly status = 401;
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}
