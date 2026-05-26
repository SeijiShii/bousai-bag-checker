import { composition } from './_lib/composition';
import { withUser, sendError, type ApiReq, type ApiRes } from './_lib/handler';

/** /api/tip — POST: 投げ銭 Checkout 作成 (金額サーバー強制 100円、D-028 アンロックなし)。 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { core } = composition();
  try {
    return await withUser(req, res, async (uid) => ({ body: await core.createTipCheckout(uid) }));
  } catch (e) {
    sendError(res, e);
  }
}
