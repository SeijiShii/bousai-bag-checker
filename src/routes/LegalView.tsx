import { useTranslation } from 'react-i18next';
import { PrivacyPolicy } from '@/features/legal/privacy';
import { Terms } from '@/features/legal/terms';
import { Tokushoho } from '@/features/legal/tokushoho';
import { useLocale } from '@/i18n';

export interface LegalViewProps {
  /** window.location.pathname (例: /legal/privacy) */
  path: string;
}

/**
 * 法務ページ表示 (フッタ §LEGAL_LINKS から遷移)。path ベースで privacy/terms/特商法を出し分け。
 * 法務本文は日本語を正本とし (concept §9.2)、非 ja ロケールでは「正本は日本語」注記を本文上に表示。
 */
export function LegalView({ path }: LegalViewProps) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const page = path.replace(/^\/legal\//, '').replace(/\/$/, '');
  const body =
    page === 'privacy' ? (
      <PrivacyPolicy />
    ) : page === 'terms' ? (
      <Terms />
    ) : page === 'specified-commercial-transactions' ? (
      <Tokushoho />
    ) : (
      <p>{t('common.notFound')}</p>
    );
  const isLegalPage = page === 'privacy' || page === 'terms' || page === 'specified-commercial-transactions';

  return (
    <div className="mx-auto max-w-md p-4">
      <a href="/" className="text-sm text-primary hover:underline">
        {t('common.backToTop')}
      </a>
      {isLegalPage && locale !== 'ja' ? (
        <p className="mt-4 rounded-md bg-surface-muted p-2 text-xs text-text-muted">{t('legal.jaAuthoritative')}</p>
      ) : null}
      <div className="mt-4">{body}</div>
    </div>
  );
}
