import { composition } from '../_lib/composition';
import { withUser, type ApiReq, type ApiRes } from '../_lib/handler';

/** /api/shopping/generate — POST: 期限切れ/近い品目から TODO 生成 (重複防止 R2)。 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { core } = composition();
  return withUser(req, res, async (uid) => ({ body: await core.generateShopping(uid) }));
}
