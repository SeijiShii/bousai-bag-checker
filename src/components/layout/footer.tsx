import { useTranslation } from 'react-i18next';

// フッタ: 法務リンク + 控えめなメイカー文脈 (§4.8.4、煽らない)。ラベルは i18n キー。
export const LEGAL_LINKS = [
  { href: '/legal/privacy', labelKey: 'footer.privacy' },
  { href: '/legal/terms', labelKey: 'footer.terms' },
  { href: '/legal/specified-commercial-transactions', labelKey: 'footer.tokushoho' },
] as const;

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-border p-4 text-sm text-text-muted">
      <nav aria-label={t('footer.legal')} className="flex flex-wrap gap-4">
        {LEGAL_LINKS.map((l) => (
          <a key={l.href} href={l.href} className="hover:text-text">
            {t(l.labelKey)}
          </a>
        ))}
      </nav>
      <p className="mt-2 text-xs">{t('footer.tagline')}</p>
    </footer>
  );
}
