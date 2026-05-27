import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ja from "./locales/ja.json";
import en from "./locales/en.json";
import zhHans from "./locales/zh-Hans.json";
import ko from "./locales/ko.json";

export const SUPPORTED_LOCALES = ["ja", "en", "zh-Hans", "ko"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** localStorage の永続キー。useLocale が読み書きする。 */
export const LOCALE_STORAGE_KEY = "bousai.locale";

/** ブラウザ/保存値の言語タグを対応 4 ロケールに正規化。未対応は ja (正本/フォールバック)。 */
export function normalizeLocale(raw: string | null | undefined): Locale {
  if (!raw) return "ja";
  const l = raw.toLowerCase();
  if (l.startsWith("ja")) return "ja";
  if (l.startsWith("en")) return "en";
  if (l.startsWith("ko")) return "ko";
  if (l.startsWith("zh")) return "zh-Hans"; // zh / zh-CN / zh-Hans / zh-SG 等は簡体に寄せる
  return "ja";
}

/** 初期ロケール検出: localStorage の永続選択 → ブラウザ Accept-Language → ja (SPEC §2.1)。 */
export function detectInitialLocale(): Locale {
  try {
    if (typeof localStorage !== "undefined") {
      const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (saved) return normalizeLocale(saved);
    }
  } catch {
    // localStorage 不可環境はスキップ
  }
  const nav =
    typeof navigator !== "undefined"
      ? (navigator.languages?.[0] ?? navigator.language)
      : null;
  return normalizeLocale(nav);
}

void i18n.use(initReactI18next).init({
  resources: {
    ja: { translation: ja },
    en: { translation: en },
    "zh-Hans": { translation: zhHans },
    ko: { translation: ko },
  },
  lng: detectInitialLocale(),
  fallbackLng: "ja",
  supportedLngs: [...SUPPORTED_LOCALES],
  interpolation: { escapeValue: false },
  returnNull: false,
});

// `<html lang>` を現ロケールに同期 (a11y/SEO)。初期検出・リロード・手動切替すべてを languageChanged で一元化。
function applyHtmlLang(lng: string): void {
  if (typeof document !== "undefined") {
    document.documentElement.lang = normalizeLocale(lng);
  }
}
i18n.on("languageChanged", applyHtmlLang);
applyHtmlLang(i18n.language);

export default i18n;
