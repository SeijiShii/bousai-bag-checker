import { test, expect } from '@playwright/test';

// 004 inspection: 季節点検チェックリスト → 完了で記録。
test('点検チェックリスト → 完了で記録メッセージ', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation', { name: 'メインナビ' }).getByRole('button', { name: /点検/ }).click();
  await expect(page.getByRole('heading', { name: '点検', level: 2 })).toBeVisible();

  // seed 品目がチェックリストに並ぶ
  await expect(page.getByText('保存水 2L')).toBeVisible();
  // 1 件確認してから完了
  await page.getByRole('checkbox', { name: '保存水 2Lを確認済みにする' }).check();
  await page.getByRole('button', { name: '点検を完了する' }).click();

  await expect(page.getByText(/点検を記録しました/)).toBeVisible();
});
