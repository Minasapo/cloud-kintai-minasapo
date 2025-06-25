import { expect } from "@playwright/test";

import { test } from "./console-log-fixture";

const basePath = process.env.VITE_BASE_PATH || "http://localhost:5173";

test.use({ storageState: "playwright/.auth/lazy-user.json" });

test.describe.configure({ retries: 2 });

test("1週間以上経過した打刻エラーの警告が表示されること", async ({ page }) => {
  await page.goto(`${basePath}/`);
  await expect(
    page.locator('[data-testid="time-elapsed-error-dialog-title-text"]')
  ).toBeVisible();
});
