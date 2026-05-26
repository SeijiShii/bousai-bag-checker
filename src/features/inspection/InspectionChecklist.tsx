import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusChip } from '@/components/ui/status-chip';
import { EmptyState } from '@/components/ui/empty-state';
import type { ItemWithFreshness } from '@/features/inventory';

export interface InspectionChecklistProps {
  items: ItemWithFreshness[];
  onComplete: (summary: { total: number; checked: number; needsReplace: number }) => void;
}

/** 季節点検チェックリスト。各品目を確認 → 完了で inspection_log 記録 + 「全部グリーン」サマリ。 */
export function InspectionChecklist({ items, onComplete }: InspectionChecklistProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState(false);

  if (items.length === 0) {
    return <EmptyState message="登録された品目がありません。" />;
  }
  if (done) {
    const allGreen = items.every((i) => i.freshness === 'fresh');
    return <p className="text-base text-fresh">{allGreen ? '点検完了 — 全部グリーンです。' : '点検を記録しました。'}</p>;
  }

  function complete() {
    const needsReplace = items.filter((i) => i.freshness === 'expired').length;
    onComplete({ total: items.length, checked: Object.values(checked).filter(Boolean).length, needsReplace });
    setDone(true);
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Card className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  aria-label={`${item.name}を確認済みにする`}
                  checked={!!checked[item.id]}
                  onChange={(e) => setChecked((c) => ({ ...c, [item.id]: e.target.checked }))}
                />
                {item.name}
              </label>
              <StatusChip status={item.freshness} />
            </Card>
          </li>
        ))}
      </ul>
      <Button onClick={complete}>点検を完了する</Button>
    </div>
  );
}
