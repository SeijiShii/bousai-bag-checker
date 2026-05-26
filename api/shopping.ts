import { composition } from './_lib/composition';
import { withUser, type ApiReq, type ApiRes } from './_lib/handler';

/** /api/shopping — GET 一覧 / PATCH 購入トグル (?id=, body{isBought})。所有者分離 (SEC-001)。生成は /api/shopping/generate。 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  const { core } = composition();
  if (req.method === 'GET') {
    return withUser(req, res, async (uid) => ({ body: await core.listShopping(uid) }));
  }
  if (req.method === 'PATCH') {
    return withUser(req, res, async (uid) => {
      const id = String(req.query.id ?? '');
      const isBought = Boolean((req.body as { isBought?: unknown } | undefined)?.isBought);
      const row = await core.setShoppingBought(uid, id, isBought);
      return row ? { body: row } : { status: 404, body: { error: 'Not Found' } };
    });
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}
