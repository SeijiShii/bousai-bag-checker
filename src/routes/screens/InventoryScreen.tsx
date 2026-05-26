/**
 * 品目画面。Phase A は雛形 (見出し + プレースホルダ)。
 * Phase C で Backend port + ItemList/ItemForm に配線する。
 */
export function InventoryScreen() {
  return (
    <section aria-labelledby="inventory-heading">
      <h2 id="inventory-heading" className="mb-3 text-lg font-semibold text-text">
        品目
      </h2>
      <p className="text-text-muted">準備中…</p>
    </section>
  );
}
