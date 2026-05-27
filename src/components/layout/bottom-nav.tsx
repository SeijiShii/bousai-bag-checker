import { Package, ClipboardCheck, ShoppingCart, Settings } from "lucide-react";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

export const NAV_ITEMS = [
  { key: "inventory", labelKey: "nav.inventory", Icon: Package },
  { key: "inspection", labelKey: "nav.inspection", Icon: ClipboardCheck },
  { key: "shopping", labelKey: "nav.shopping", Icon: ShoppingCart },
  { key: "settings", labelKey: "nav.settings", Icon: Settings },
] as const satisfies readonly {
  key: string;
  labelKey: string;
  Icon: ComponentType<{ className?: string }>;
}[];

export type NavKey = (typeof NAV_ITEMS)[number]["key"];

export interface BottomNavProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}

/** モバイルボトムタブ (品目/点検/買い物/設定)。design-system §5。 */
export function BottomNav({ active, onNavigate }: BottomNavProps) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("nav.aria")}
      className="flex border-t border-border bg-surface"
    >
      {NAV_ITEMS.map(({ key, labelKey, Icon }) => (
        <button
          key={key}
          type="button"
          aria-current={active === key ? "page" : undefined}
          onClick={() => onNavigate(key)}
          className={cn(
            "flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-2 text-xs",
            active === key ? "text-primary" : "text-text-muted",
          )}
        >
          <Icon className="h-5 w-5" />
          {t(labelKey)}
        </button>
      ))}
    </nav>
  );
}
