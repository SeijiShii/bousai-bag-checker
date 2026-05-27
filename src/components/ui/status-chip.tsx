import { Leaf, Clock, RefreshCw } from "lucide-react";
import type { ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { FreshnessStatus } from "@/lib/tokens";

// 鮮度3段階。純赤・点滅は使わない (不安を煽らない)。lucide アイコン (絵文字不使用)。ラベルは i18n キー (status.*)。
const STATUS_META: Record<
  FreshnessStatus,
  { labelKey: string; cls: string; Icon: ComponentType<{ className?: string }> }
> = {
  fresh: {
    labelKey: "status.fresh",
    cls: "bg-surface-muted text-fresh",
    Icon: Leaf,
  },
  warn: { labelKey: "status.warn", cls: "bg-warn-bg text-warn", Icon: Clock },
  expired: {
    labelKey: "status.expired",
    cls: "bg-expired-bg text-expired",
    Icon: RefreshCw,
  },
};

export interface StatusChipProps {
  status: FreshnessStatus;
  className?: string;
}

/** 鮮度状態チップ (design-system §5、トークン色)。 */
export function StatusChip({ status, className }: StatusChipProps) {
  const { t } = useTranslation();
  const { labelKey, cls, Icon } = STATUS_META[status];
  const label = t(labelKey);
  return (
    <span
      data-status={status}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-sm",
        cls,
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </span>
  );
}
