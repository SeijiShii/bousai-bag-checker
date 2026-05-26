import { ShieldCheck } from 'lucide-react';
import { InfoButton } from '@/components/ui/info-button';

/**
 * アプリヘッダ: サービス名 + O41「これは何？」インフォボタン。
 * リンク流入の初見ユーザーがサービスの正体をすぐ把握できるようにする (design-system O41)。
 */
export function AppHeader() {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        <h1 className="text-base font-semibold text-text">持ち出し袋チェッカー</h1>
      </div>
      <InfoButton title="このサービスについて">
        <p>
          防災の持ち出し袋に入れた水・食料・電池などを登録すると、消費期限や交換目安が近づいたときにお知らせします。
          いざという時の「気づいたら期限切れ」を防ぐためのチェッカーです。
        </p>
        <p className="mt-2 text-text-muted">
          すべての機能を無料で使えます。役に立ったら 100 円の投げ銭で応援できます（任意）。
        </p>
      </InfoButton>
    </header>
  );
}
