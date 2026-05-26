import { useState } from 'react';
import { InspectionChecklist } from '@/features/inspection';
import { useBackend } from '@/services/backend';
import { useBackendData } from '../useBackendData';
import type { InspectionSummary } from '@/services/backend';

/** 点検画面: 全品目のチェックリスト → 完了で点検記録。 */
export function InspectionScreen() {
  const backend = useBackend();
  const { data: items, loading } = useBackendData(() => backend.listItems());
  const [done, setDone] = useState<InspectionSummary | null>(null);

  async function handleComplete(summary: InspectionSummary) {
    await backend.recordInspection(summary);
    setDone(summary);
  }

  return (
    <section aria-labelledby="inspection-heading">
      <h2 id="inspection-heading" className="mb-3 text-lg font-semibold text-text">
        点検
      </h2>
      {loading ? (
        <p className="text-text-muted">読み込み中…</p>
      ) : done ? (
        <p className="text-fresh" role="status">
          点検を記録しました（{done.checked}/{done.total} 確認）。
        </p>
      ) : (
        <InspectionChecklist items={items ?? []} onComplete={handleComplete} />
      )}
    </section>
  );
}
