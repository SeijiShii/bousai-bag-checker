import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import type { ShoppingItem } from '@/types/db';

export interface ShoppingListProps {
  items: ShoppingItem[];
  onToggle: (id: string, isBought: boolean) => void;
  onGenerate: () => void;
  onExport?: () => void;
}

/** 買い物 TODO リスト(無料、課金導線なし — D-028)。未購入/購入済を区別。 */
export function ShoppingList({ items, onToggle, onGenerate, onExport }: ShoppingListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={onGenerate}>リストを生成</Button>
        {onExport ? (
          <Button variant="secondary" onClick={onExport}>
            CSV で書き出し
          </Button>
        ) : null}
      </div>
      {items.length === 0 ? (
        <EmptyState message="買い物リストは空です。点検後に「リストを生成」できます。" />
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Card className="flex items-center gap-2">
                <input
                  type="checkbox"
                  aria-label={`${item.name}を購入済みにする`}
                  checked={item.isBought}
                  onChange={(e) => onToggle(item.id, e.target.checked)}
                />
                <span className={item.isBought ? 'text-text-muted line-through' : 'text-text'}>{item.name}</span>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
