import { composition } from './_lib/composition';
import { withUser, clientKey, sendError, type ApiReq, type ApiRes } from './_lib/handler';

/** /api/feedback — POST: 好き嫌い/バグ報告 (PII scrub + レート制限は service 内、SEC-002/004)。 */
export default async function handler(req: ApiReq, res: ApiRes): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { core } = composition();
  // フィードバックはログイン不要 (userId は任意)。ここでは認証済 uid を渡す簡略版。
  try {
    return await withUser(req, res, async (uid) => {
      const result = await core.submitFeedback(uid, req.body, clientKey(req), {
        ua: String(req.headers['user-agent'] ?? ''),
      });
      return result === 'rate_limited'
        ? { status: 429, body: { error: 'Too Many Requests' } }
        : { status: 201 };
    });
  } catch (e) {
    sendError(res, e);
  }
}
