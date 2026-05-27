import { test, expect } from '@playwright/test';

// 004 _shared/i18n: 言語切替ジャーニー S1-S7。
// config の locale='ja-JP' で既定 ja。switcher は data-testid="language-switcher" の <select>。

const SW = '[data-testid="language-switcher"]';

test('I18N-S1: 既定ロケールは ja (ナビが日本語、html lang=ja)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'メインナビ' })).toBeVisible();
  await expect(page.getByRole('button', { name: /品目/ })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
});

test('I18N-S2/S3: en に切替 → UI 即時英語化 + html lang=en、リロードで永続', async ({ page }) => {
  await page.goto('/');
  await page.locator(SW).selectOption('en');
  // ナビが英語化
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Items/ })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  // リロードで永続 (localStorage)
  await page.reload();
  await expect(page.getByRole('button', { name: /Items/ })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('I18N-S4: ko / zh-Hans に切替', async ({ page }) => {
  await page.goto('/');
  await page.locator(SW).selectOption('ko');
  await expect(page.getByRole('button', { name: /물품/ })).toBeVisible();
  await page.locator(SW).selectOption('zh-Hans');
  await expect(page.getByRole('button', { name: /物品/ })).toBeVisible();
});

test('I18N-S5: ブラウザ Accept-Language=en で初期 en (検出)', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'en-US' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Items/ })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await ctx.close();
});

test('I18N-S6: 法務ページは非 ja で「正本は日本語」注記 + 本文 JA', async ({ page }) => {
  await page.goto('/');
  await page.locator(SW).selectOption('en');
  await page.goto('/legal/privacy');
  await expect(page.getByText('The authoritative version of this document is in Japanese.')).toBeVisible();
});

test('I18N-S7: 品目フォームの種類は enum 生値でなくロケールラベル', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '追加' }).click();
  const select = page.getByLabel('種類');
  // option ラベルが「水」(enum 生値 water でない)
  await expect(select.locator('option', { hasText: '水' })).toHaveCount(1);
  await expect(select.getByText('water')).toHaveCount(0);
});

test('I18N: キー名が画面に露出していない (フォールバック健全)', async ({ page }) => {
  await page.goto('/');
  await page.locator(SW).selectOption('en');
  // ドット区切りの生キー (例 nav.inventory) が body に出ていない
  await expect(page.locator('body')).not.toContainText('nav.inventory');
  await expect(page.locator('body')).not.toContainText('common.loading');
});
