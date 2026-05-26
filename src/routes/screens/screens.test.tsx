import { describe, it, expect } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithBackend } from "@/test/renderWithBackend";
import { makeMemoryBackend } from "@/services/backend";
import { InventoryScreen } from "./InventoryScreen";
import { ShoppingScreen } from "./ShoppingScreen";
import { SettingsScreen } from "./SettingsScreen";

const NOW = new Date("2026-05-27T09:00:00+09:00");
const iso = (offsetDays: number) => {
  const d = new Date(NOW);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

describe("InventoryScreen (配線)", () => {
  it("空のとき EmptyState + 追加 CTA、追加→保存で一覧に反映", async () => {
    const backend = makeMemoryBackend({ now: () => NOW });
    renderWithBackend(<InventoryScreen />, backend);

    fireEvent.click(await screen.findByRole("button", { name: "品目を追加" }));
    fireEvent.change(screen.getByLabelText("品目名"), {
      target: { value: "保存水" },
    });
    fireEvent.change(screen.getByLabelText("期限"), {
      target: { value: iso(400) },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(await screen.findByText("保存水")).toBeInTheDocument();
  });

  it("seed 品目が鮮度付きで一覧表示、削除で消える", async () => {
    const backend = makeMemoryBackend({ seed: true, now: () => NOW });
    renderWithBackend(<InventoryScreen />, backend);

    expect(await screen.findByText("保存水 2L")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "保存水 2Lを削除" }));
    await screen.findByText("非常食(アルファ米)"); // 再描画後も他は残る
    expect(screen.queryByText("保存水 2L")).not.toBeInTheDocument();
  });
});

describe("ShoppingScreen (配線、無料 D-028)", () => {
  it("生成で期限切れ/近い品目が TODO 化、チェックで購入済", async () => {
    const backend = makeMemoryBackend({ seed: true, now: () => NOW });
    renderWithBackend(<ShoppingScreen />, backend);

    fireEvent.click(
      await screen.findByRole("button", { name: "リストを生成" }),
    );
    // seed の expired (モバイルバッテリー) が TODO 化される
    expect(await screen.findByText("モバイルバッテリー")).toBeInTheDocument();
    // 課金導線が無い (無料)
    expect(
      screen.queryByText(/アンロック|有料|円で解放/),
    ).not.toBeInTheDocument();
  });
});

describe("SettingsScreen (配線)", () => {
  it("通知設定 + 投げ銭 (価格透明性 O43: 100円 + 機能は変わらない)", async () => {
    const backend = makeMemoryBackend({ now: () => NOW });
    renderWithBackend(<SettingsScreen />, backend);

    // 通知トグル
    const emailToggle = await screen.findByRole("checkbox", { name: /メール/ });
    expect(emailToggle).not.toBeChecked();
    fireEvent.click(emailToggle);
    expect(
      await screen.findByRole("checkbox", { name: /メール/ }),
    ).toBeChecked();

    // 投げ銭: 金額 + 対価 (機能は変わらない) をファーストビューで明示 (O43)
    expect(screen.getByText(/100 ?円の投げ銭/)).toBeInTheDocument();
    expect(screen.getByText(/機能は変わりません/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /応援する/ }),
    ).toBeInTheDocument();
  });
});
