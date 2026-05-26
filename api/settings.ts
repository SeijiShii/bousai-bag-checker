import { composition } from './_lib/composition';
import { withUser, type ApiReq, type ApiRes } from './_lib/handler';
import type { NotificationSettings } from '../src/services/backend/port';

/** /api/settings — GET 取得 / PATCH 更新 (通知購読)。 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  const { core } = composition();
  if (req.method === 'GET') {
    return withUser(req, res, async (uid) => ({ body: await core.getSettings(uid) }));
  }
  if (req.method === 'PATCH') {
    return withUser(req, res, async (uid) => {
      await core.updateSettings(uid, (req.body ?? {}) as Partial<NotificationSettings>);
      return { body: await core.getSettings(uid) };
    });
  }
  res.status(405).json({ error: 'Method Not Allowed' });
}
