import { test, expect } from "@playwright/test";

// 004 inventory: UC1 一覧 / UC2 登録・バリデーション / UC3 削除。
// dev は memory backend (seed: 保存水2L=fresh / 非常食=warn / モバイルバッテリー=expired)。
// UC3-S2 IDOR は api 層 (apiCore.test の SEC-001) でカバー (memory は単一ユーザーのため E2E 対象外)。

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("UC1: 品目一覧に seed 品目 + 鮮度 StatusChip が出る", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "品目", level: 2 }),
  ).toBeVisible();
  await expect(page.getByText("保存水 2L")).toBeVisible();
  await expect(page.getByText("非常食(アルファ米)")).toBeVisible();
  await expect(page.getByText("モバイルバッテリー")).toBeVisible();
  await expect(page.getByText("問題なし")).toBeVisible();
  await expect(page.getByText("交換の時期")).toBeVisible();
});

test("UC2-S1: 追加 → name+期限 入力 → 保存 で一覧に反映", async ({ page }) => {
  await page.getByRole("button", { name: "追加" }).click();
  await page.getByLabel("品目名").fill("携帯トイレ");
  await page.getByLabel("期限").fill("2027-12-31");
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("携帯トイレ")).toBeVisible();
});

test("UC2-S3: name 空で保存するとエラー、保存されない", async ({ page }) => {
  await page.getByRole("button", { name: "追加" }).click();
  await page.getByRole("button", { name: "保存" }).click();
  await expect(page.getByText("品目名を入力してください")).toBeVisible();
  // フォームのまま (一覧に戻っていない)
  await expect(page.getByRole("button", { name: "保存" })).toBeVisible();
});

test("UC3-S1: 削除で一覧から消える", async ({ page }) => {
  await expect(page.getByText("保存水 2L")).toBeVisible();
  await page.getByRole("button", { name: "保存水 2Lを削除" }).click();
  await expect(page.getByText("保存水 2L")).toHaveCount(0);
});
