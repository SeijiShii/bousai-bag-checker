import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import { useLocale, type Locale } from "@/i18n";

// 各言語は自言語表記 (endonym) で出す (言語切替の慣習)。
const LOCALE_ENDONYM: Record<Locale, string> = {
  ja: "日本語",
  en: "English",
  "zh-Hans": "简体中文",
  ko: "한국어",
};

/** 言語切替 (4 言語)。ヘッダに配置。選択で即時切替 + localStorage 永続 (useLocale)。 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { locale, locales, setLocale } = useLocale();
  return (
    <label
      className={cn(
        "inline-flex items-center gap-1 text-text-muted",
        className,
      )}
    >
      <Globe className="h-4 w-4" aria-hidden="true" />
      <select
        data-testid="language-switcher"
        aria-label={t("language.label")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="min-h-[44px] rounded-md bg-transparent px-1 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        {locales.map((l) => (
          <option key={l} value={l}>
            {LOCALE_ENDONYM[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
