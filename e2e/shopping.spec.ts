import { test, expect } from "@playwright/test";

// 004 shopping-list: UC4 生成 / 購入トグル / CSV。無料 (D-028、課金導線なし)。
async function gotoShopping(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "メインナビ" })
    .getByRole("button", { name: /買い物/ })
    .click();
  await expect(
    page.getByRole("heading", { name: "買い物", level: 2 }),
  ).toBeVisible();
}

test("UC4-S1: 生成で期限切れ/近い品目が TODO 化", async ({ page }) => {
  await gotoShopping(page);
  await page.getByRole("button", { name: "買い物リストを作る" }).click();
  // seed の expired (モバイルバッテリー) が TODO に出る
  await expect(page.getByText("モバイルバッテリー")).toBeVisible();
});

test("UC4-S2: 購入チェックで購入済になる", async ({ page }) => {
  await gotoShopping(page);
  await page.getByRole("button", { name: "買い物リストを作る" }).click();
  const toggle = page.getByRole("checkbox", {
    name: "モバイルバッテリーを購入済みにする",
  });
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await expect(
    page.getByRole("checkbox", { name: "モバイルバッテリーを購入済みにする" }),
  ).toBeChecked();
});

test("UC4-S6: 課金導線が無い (無料 D-028)", async ({ page }) => {
  await gotoShopping(page);
  await expect(page.getByText(/アンロック|有料|円で解放/)).toHaveCount(0);
});
