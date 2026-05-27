import { useTranslation } from "react-i18next";
import { ShoppingList } from "@/features/shopping-list";
import { useBackend } from "@/services/backend";
import { useBackendData } from "../useBackendData";
import { downloadTextFile } from "@/lib/download";

/** 買い物画面: TODO 一覧 + 生成 (期限切れ/近い品目から) + CSV エクスポート。無料 (D-028)。 */
export function ShoppingScreen() {
  const { t } = useTranslation();
  const backend = useBackend();
  const {
    data: items,
    loading,
    reload,
  } = useBackendData(() => backend.listShopping());

  async function handleToggle(id: string, isBought: boolean) {
    await backend.setShoppingBought(id, isBought);
    reload();
  }

  async function handleGenerate() {
    await backend.generateShopping();
    reload();
  }

  async function handleExport() {
    const csv = await backend.exportShoppingCsv();
    downloadTextFile("shopping-list.csv", csv);
  }

  return (
    <section aria-labelledby="shopping-heading">
      <h2
        id="shopping-heading"
        className="mb-3 text-lg font-semibold text-text"
      >
        {t("nav.shopping")}
      </h2>
      {loading ? (
        <p className="text-text-muted">{t("common.loading")}</p>
      ) : (
        <ShoppingList
          items={items ?? []}
          onToggle={handleToggle}
          onGenerate={handleGenerate}
          onExport={handleExport}
        />
      )}
    </section>
  );
}
