import { composition } from './_lib/composition';
import { withUser, type ApiReq, type ApiRes } from './_lib/handler';

/** /api/items — GET 一覧 / POST 追加 / DELETE 削除 (?id=)。所有者分離 (SEC-001)。 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  const { core } = composition();
  if (req.method === 'GET') {
    return withUser(req, res, async (uid) => ({ body: await core.listItems(uid) }));
  }
  if (req.method === 'POST') {
    return withUser(req, res, async (uid) => {
      await core.createItem(uid, req.body);
      return { status: 201 };
    });
  }
  if (req.method === 'DELETE') {
    return withUser(req, res, async (uid) => {
      const id = String(req.query.id ?? '');
      const ok = await core.removeItem(uid, id);
      return ok ? { status: 204 } : { status: 404, body: { error: 'Not Found' } };
    });
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}
