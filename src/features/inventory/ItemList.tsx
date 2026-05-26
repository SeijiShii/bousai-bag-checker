import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/ui/status-chip';
import { EmptyState } from '@/components/ui/empty-state';
import type { ItemWithFreshness } from './inventoryService';

export interface ItemListProps {
  items: ItemWithFreshness[];
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function ItemList({ items, onDelete, onAdd }: ItemListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        message="まだ品目が登録されていません。最初の品目を追加しましょう。"
        action={onAdd ? <Button onClick={onAdd}>品目を追加</Button> : undefined}
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
              <Button variant="ghost" aria-label={`${item.name}を削除`} onClick={() => onDelete(item.id)}>
                削除
              </Button>
            ) : null}
          </Card>
        </li>
      ))}
    </ul>
  );
}
