/**
 * 直行/直帰モードのE2Eテスト。
 * - 直行/直帰モードのUI表示とボタン動作を検証する。
 * - Playwrightを使用。
 * @module playwright/tests/attendance-direct-flow.spec
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

import { test } from "./console-log-fixture";

const basePath = process.env.VITE_BASE_PATH || "http://localhost:5173";

test.describe.configure({ retries: 0 });

test.use({ storageState: "playwright/.auth/out-user.json" });

async function toggleDirectMode(page: Page) {
  await page.click('[data-testid="direct-mode-switch"]');
}

test.describe.serial("直行/直帰モード(ON)", () => {
  test("直行/直帰表示", async ({ page }) => {
    await page.goto(`${basePath}/`);

    await toggleDirectMode(page);

    await expect(
      page.locator('[data-testid="go-directly-button"]')
    ).toBeVisible();

    await expect(
      page.locator('[data-testid="return-directly-button"]')
    ).toBeVisible();
  });

  test("直行をクリック", async ({ page }) => {
    await page.goto(`${basePath}/`);
    await toggleDirectMode(page);
    await page.click('[data-testid="go-directly-button"]');
    await expect(page.locator('[data-testid="work-status-text"]')).toHaveText(
      "勤務中"
    );

    await expect(page.locator("body")).toContainText("出勤(直行)しました");
  });

  test("直帰をクリック", async ({ page }) => {
    await page.goto(`${basePath}/`);

    await toggleDirectMode(page);

    await expect(
      page.locator('[data-testid="return-directly-button"]')
    ).toBeVisible();

    await page.click('[data-testid="return-directly-button"]');

    await expect(page.locator('[data-testid="work-status-text"]')).toHaveText(
      "勤務終了"
    );

    await expect(page.locator("body")).toContainText("退勤(直帰)しました");
  });
});
