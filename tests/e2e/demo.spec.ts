import { expect, test, type Page } from '@playwright/test';

const setDemoWidth = async (page: Page, width: number): Promise<void> => {
  await page.getByTestId('width-slider').evaluate((element, value) => {
    const input = element as HTMLInputElement;

    input.value = String(value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, width);
};

test.describe('SmartOverflow demo', () => {
  test('keeps all actions visible at full width', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Duplicate' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();

    await expect(page.getByTestId('more-wrapper')).toBeHidden();
    await expect(page.getByTestId('debug-output')).toContainText('"hidden": []');
  });

  test('moves lower-priority actions into More when width shrinks', async ({ page }) => {
    await page.goto('/');

    await setDemoWidth(page, 360);

    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Archive' })).toBeHidden();
    await expect(page.getByTestId('more-button')).toBeVisible();

    await page.getByTestId('more-button').click();

    await expect(page.getByRole('menuitem', { name: 'Archive' })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Share' })).toBeVisible();
  });

  test('updates placement again when the width grows', async ({ page }) => {
    await page.goto('/');

    await setDemoWidth(page, 320);

    await expect(page.getByTestId('more-button')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive' })).toBeHidden();

    await setDemoWidth(page, 760);

    await expect(page.getByTestId('more-wrapper')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Share' })).toBeVisible();
  });
});
