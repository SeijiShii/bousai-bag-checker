import { useState, type ReactNode } from "react";
import { HelpCircle, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";

export interface InfoButtonProps {
  /** モーダル見出し。 */
  title: string;
  /** 「これは何？」の本文 (concept §1 由来、O38 準拠の平易な言葉)。 */
  children: ReactNode;
  className?: string;
}

/**
 * 入口の「これは何？」導線 (O41)。丸付き「?」+ 軽量モーダル。
 * リンク流入の初見者がサービスの正体を理解できるようにする。
 */
export function InfoButton({ title, children, className }: InfoButtonProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label={title}
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus hover:bg-surface-muted",
          className,
        )}
      >
        <HelpCircle className="h-5 w-5" />
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
        >
          <div className="max-w-md rounded-lg bg-surface p-5 shadow-[0_4px_12px_rgba(42,47,44,.10)]">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg text-text">{title}</h2>
              <button
                type="button"
                aria-label={t("common.close")}
                onClick={() => setOpen(false)}
                className="text-text-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-base text-text">{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
