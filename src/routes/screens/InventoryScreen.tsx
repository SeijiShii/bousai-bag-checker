import { useState } from "react";
import { ItemList, ItemForm, type ItemInput } from "@/features/inventory";
import { Button } from "@/components/ui/button";
import { useBackend } from "@/services/backend";
import { useBackendData } from "../useBackendData";

/** 品目画面: 一覧 (鮮度 StatusChip) + 追加フォーム (動的 freshness 入力)。 */
export function InventoryScreen() {
  const backend = useBackend();
  const {
    data: items,
    loading,
    reload,
  } = useBackendData(() => backend.listItems());
  const [adding, setAdding] = useState(false);

  async function handleSubmit(input: ItemInput) {
    await backend.createItem(input);
    setAdding(false);
    reload();
  }

  async function handleDelete(id: string) {
    await backend.removeItem(id);
    reload();
  }

  return (
    <section aria-labelledby="inventory-heading">
      <div className="mb-3 flex items-center justify-between">
        <h2 id="inventory-heading" className="text-lg font-semibold text-text">
          品目
        </h2>
        {!adding ? <Button onClick={() => setAdding(true)}>追加</Button> : null}
      </div>
      {adding ? (
        <div className="flex flex-col gap-2">
          <ItemForm onSubmit={handleSubmit} />
          <Button variant="ghost" onClick={() => setAdding(false)}>
            キャンセル
          </Button>
        </div>
      ) : loading ? (
        <p className="text-text-muted">読み込み中…</p>
      ) : (
        <ItemList
          items={items ?? []}
          onDelete={handleDelete}
          onAdd={() => setAdding(true)}
        />
      )}
    </section>
  );
}
