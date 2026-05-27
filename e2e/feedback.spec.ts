import { test, expect } from '@playwright/test';

// 004 feedback: 設定画面の 👍/👎 + バグ報告ウィジェット (UC5)。
async function gotoSettings(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'メインナビ' }).getByRole('button', { name: /設定/ }).click();
  await expect(page.getByRole('heading', { name: '設定', level: 2 })).toBeVisible();
}

test('UC5-S1: 👍 リアクション送信 → お礼', async ({ page }) => {
  await gotoSettings(page);
  await page.getByRole('button', { name: '良い' }).click();
  await expect(page.getByText('ありがとうございます。')).toBeVisible();
});

test('UC5-S2: 不具合報告 → 入力 → 送信 → お礼', async ({ page }) => {
  await gotoSettings(page);
  await page.getByRole('button', { name: '不具合を報告' }).click();
  await page.getByLabel('不具合の内容').fill('点検通知が届きません');
  await page.getByRole('button', { name: '送信' }).click();
  await expect(page.getByText('ありがとうございます。')).toBeVisible();
});

test('UC5: 投げ銭の価格透明性 (100円・機能は変わらない、O43)', async ({ page }) => {
  await gotoSettings(page);
  await expect(page.getByText(/100 ?円の投げ銭/)).toBeVisible();
  await expect(page.getByText(/機能は変わりません/)).toBeVisible();
});
