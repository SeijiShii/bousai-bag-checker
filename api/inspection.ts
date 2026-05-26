import { composition } from './_lib/composition';
import { withUser, type ApiReq, type ApiRes } from './_lib/handler';

/** /api/inspection — POST: 点検結果を記録。 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { core } = composition();
  return withUser(req, res, async (uid) => {
    const b = (req.body ?? {}) as { total?: number; checked?: number; needsReplace?: number };
    await core.recordInspection(uid, {
      total: Number(b.total ?? 0),
      checked: Number(b.checked ?? 0),
      needsReplace: Number(b.needsReplace ?? 0),
    });
    return { status: 201 };
  });
}
