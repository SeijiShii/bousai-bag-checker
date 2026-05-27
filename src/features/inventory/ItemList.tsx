import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/ui/status-chip";
import { EmptyState } from "@/components/ui/empty-state";
import type { ItemWithFreshness } from "./inventoryService";

export interface ItemListProps {
  items: ItemWithFreshness[];
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function ItemList({ items, onDelete, onAdd }: ItemListProps) {
  const { t } = useTranslation();
  if (items.length === 0) {
    return (
      <EmptyState
        message={t("inventory.empty")}
        action={
          onAdd ? (
            <Button onClick={onAdd}>{t("inventory.addItem")}</Button>
          ) : undefined
        }
      />
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <Card className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-base text-text">{item.name}</span>
              <StatusChip status={item.freshness} />
            </div>
            {onDelete ? (
              <Button
                variant="ghost"
                aria-label={t("inventory.deleteAria", { name: item.name })}
                onClick={() => onDelete(item.id)}
              >
                {t("inventory.delete")}
              </Button>
            ) : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}
