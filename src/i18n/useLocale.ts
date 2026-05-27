import { useTranslation } from 'react-i18next';
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, normalizeLocale, type Locale } from './config';

/** `<html lang>` を現ロケールに同期 (a11y / SEO)。 */
function syncHtmlLang(locale: Locale): void {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
  }
}

/**
 * 現ロケールの取得 + 切替フック。
 * setLocale で i18n.changeLanguage + localStorage 永続 + `<html lang>` 同期。
 */
export function useLocale(): {
  locale: Locale;
  locales: readonly Locale[];
  setLocale: (l: Locale) => void;
} {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.resolvedLanguage ?? i18n.language);

  function setLocale(l: Locale): void {
    if (!SUPPORTED_LOCALES.includes(l)) return; // 未対応は無視 (4 言語のみ受理)
    void i18n.changeLanguage(l);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      // localStorage 不可環境 (プライベートモード等) は永続をスキップ
    }
    syncHtmlLang(l);
  }

  return { locale, locales: SUPPORTED_LOCALES, setLocale };
}

export { syncHtmlLang };
