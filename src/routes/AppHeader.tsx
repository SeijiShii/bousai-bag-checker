import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InfoButton } from "@/components/ui/info-button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

/**
 * アプリヘッダ: サービス名 + 言語切替 + O41「これは何？」インフォボタン。
 * リンク流入の初見ユーザーがサービスの正体をすぐ把握できるようにする (design-system O41)。
 */
export function AppHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
        <h1 className="text-base font-semibold text-text">
          {t("header.title")}
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <InfoButton title={t("header.about")}>
          <p>{t("header.aboutBody1")}</p>
          <p className="mt-2 text-text-muted">{t("header.aboutBody2")}</p>
        </InfoButton>
      </div>
    </header>
  );
}
