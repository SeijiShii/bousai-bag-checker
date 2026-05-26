import { composition } from './_lib/composition';
import { sendError, type ApiReq, type ApiRes } from './_lib/handler';

/**
 * /api/stripe-webhook — POST: Stripe webhook (署名検証 → donation 記録、冪等)。
 * 認証は署名検証 (verifyWebhook) が担う。raw body が必要なため Vercel では bodyParser 無効化が必要 (release で config)。
 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { core } = composition();
  try {
    const signature = String(req.headers['stripe-signature'] ?? '');
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? '');
    const result = await core.handleStripeWebhook(rawBody, signature);
    if (result === 'invalid') {
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }
    res.status(200).json({ result }); // recorded | duplicate
  } catch (e) {
    sendError(res, e);
  }
}

// Vercel: raw body 取得のため bodyParser 無効化 (release で有効化)
export const config = { api: { bodyParser: false } };
