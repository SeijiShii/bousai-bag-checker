import { composition } from './composition';

// Vercel Node Functions の最小 req/res 型 (@vercel/node 未導入を回避、構造的に互換)。
export interface ApiReq {
  method?: string;
  query: Record<string, string | string[] | undefined>;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
export interface ApiRes {
  status(code: number): ApiRes;
  json(body: unknown): void;
  send(body?: string): void;
  setHeader(name: string, value: string): void;
}

export interface HandlerResult {
  status?: number;
  body?: unknown;
}

/** PII を含めないエラー応答 (SEC-002)。UnauthorizedError 等の status を尊重。 */
export function sendError(res: ApiRes, e: unknown): void {
  const status =
    e && typeof e === 'object' && 'status' in e && typeof (e as { status: unknown }).status === 'number'
      ? (e as { status: number }).status
      : 500;
  const message = status === 401 ? 'Unauthorized' : status === 400 ? 'Bad Request' : 'Internal Error';
  res.status(status).json({ error: message });
}

/** 認証必須エンドポイントのラッパ。auth seam (SEC-001 の唯一の信用入口) で userId を解決して fn に渡す。 */
export async function withUser(
  req: ApiReq,
  res: ApiRes,
  fn: (userId: string) => Promise<HandlerResult>,
): Promise<void> {
  try {
    const { auth } = composition();
    const userId = await auth.requireUser(req);
    const result = await fn(userId);
    res.status(result.status ?? 200).json(result.body ?? null);
  } catch (e) {
    sendError(res, e);
  }
}

/** クライアント識別キー (レート制限用)。IP ベース、無ければ 'anon'。 */
export function clientKey(req: ApiReq): string {
  const fwd = req.headers['x-forwarded-for'];
  const ip = Array.isArray(fwd) ? fwd[0] : (fwd ?? '').split(',')[0]?.trim();
  return ip || 'anon';
}
