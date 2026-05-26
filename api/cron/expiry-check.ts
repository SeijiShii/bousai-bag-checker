import { composition } from '../_lib/composition';
import { sendError, type ApiReq, type ApiRes } from '../_lib/handler';

/**
 * /api/cron/expiry-check — Vercel Cron が叩く期限チェック通知 (冪等 R2: 同日二重通知しない)。
 * CRON_SECRET (Authorization: Bearer) で保護 (release で env 設定)。
 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  const secret = process.env.CRON_SECRET;
  const auth = String(req.headers['authorization'] ?? '');
  if (secret && auth !== `Bearer ${secret}`) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { core } = composition();
  try {
    const result = await core.runExpiryCheck();
    res.status(200).json(result); // { notified, skipped }
  } catch (e) {
    sendError(res, e);
  }
}
