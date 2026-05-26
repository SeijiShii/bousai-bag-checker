// プライバシーポリシー (§9.1)。法令本文の最終確認は公開前に人間 (§9.3、論点-S-legal-1)。
// 必須セクション: 取得情報 / 利用目的 / 委託先 / 保管期間 / 開示請求。
export const PRIVACY_SECTIONS = [
  '取得する情報',
  '利用目的',
  '第三者(委託先)への提供',
  '保管期間',
  '開示・訂正・削除の請求',
] as const;

export function PrivacyPolicy() {
  return (
    <article className="mx-auto max-w-2xl p-5">
      <h1 className="text-2xl">プライバシーポリシー</h1>
      <section>
        <h2 className="text-lg">取得する情報</h2>
        <p>メールアドレス(通知設定時)、登録した備蓄品目・数量・保管場所、利用状況。</p>
      </section>
      <section>
        <h2 className="text-lg">利用目的</h2>
        <p>備蓄の鮮度管理・期限リマインドの提供、サービス改善のため。</p>
      </section>
      <section>
        <h2 className="text-lg">第三者(委託先)への提供</h2>
        <p>認証(Clerk)、メール送信(Resend)、エラー監視(Sentry)、決済(Stripe)、画像保管(Cloudflare R2)に必要な範囲で委託します。</p>
      </section>
      <section>
        <h2 className="text-lg">保管期間</h2>
        <p>退会後、バックアップを一定期間保管後に削除します(個人情報保護法対応)。</p>
      </section>
      <section>
        <h2 className="text-lg">開示・訂正・削除の請求</h2>
        <p>運営者までご連絡ください。データのエクスポート・削除に対応します。</p>
      </section>
    </article>
  );
}
