import { PrivacyPolicy } from '@/features/legal/privacy';
import { Terms } from '@/features/legal/terms';
import { Tokushoho } from '@/features/legal/tokushoho';

export interface LegalViewProps {
  /** window.location.pathname (例: /legal/privacy) */
  path: string;
}

/** 法務ページ表示 (フッタ §LEGAL_LINKS から遷移)。path ベースで privacy/terms/特商法を出し分け。 */
export function LegalView({ path }: LegalViewProps) {
  const page = path.replace(/^\/legal\//, '').replace(/\/$/, '');
  const body =
    page === 'privacy' ? (
      <PrivacyPolicy />
    ) : page === 'terms' ? (
      <Terms />
    ) : page === 'specified-commercial-transactions' ? (
      <Tokushoho />
    ) : (
      <p>ページが見つかりません。</p>
    );

  return (
    <div className="mx-auto max-w-md p-4">
      <a href="/" className="text-sm text-primary hover:underline">
        ← トップに戻る
      </a>
      <div className="mt-4">{body}</div>
    </div>
  );
}
