import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ShoppingList } from "./ShoppingList";
import type { ShoppingItem } from "@/types/db";

function si(over: Partial<ShoppingItem>): ShoppingItem {
  return {
    id: "s1",
    userId: "u1",
    itemId: null,
    name: "乾電池",
    reason: "expired",
    isBought: false,
    boughtAt: null,
    createdAt: new Date(),
    ...over,
  };
}

describe("ShoppingList (無料、D-028)", () => {
  it("UC4-S1: 生成ボタン → onGenerate", () => {
    const onGenerate = vi.fn();
    render(
      <ShoppingList items={[]} onToggle={vi.fn()} onGenerate={onGenerate} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "買い物リストを作る" }));
    expect(onGenerate).toHaveBeenCalled();
  });

  it("UC4-S2: チェックで onToggle(id, true)", () => {
    const onToggle = vi.fn();
    render(
      <ShoppingList
        items={[si({ id: "x", name: "水" })]}
        onToggle={onToggle}
        onGenerate={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("水を購入済みにする"));
    expect(onToggle).toHaveBeenCalledWith("x", true);
  });

  it("UC4-S5: 空は EmptyState、UC4-S6: 課金導線が無い(無料)", () => {
    render(
      <ShoppingList
        items={[]}
        onToggle={vi.fn()}
        onGenerate={vi.fn()}
        onExport={vi.fn()}
      />,
    );
    expect(screen.getByText(/買い物リストは空です/)).toBeInTheDocument();
    // 課金/ペイウォール文言が無い (D-028 無料)
    expect(
      screen.queryByText(/100円|購入|アンロック|有料/),
    ).not.toBeInTheDocument();
  });
});
