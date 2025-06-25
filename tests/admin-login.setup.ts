/**
 * Playwright用の管理者ログインセットアップスクリプト。
 *
 * - 環境変数 `PLAYWRIGHT_ADMIN_EMAIL` および `PLAYWRIGHT_ADMIN_PASSWORD` を使用してログインします。
 * - ログイン後、認証状態を `playwright/.auth/admin.json` に保存します。
 *
 * @module admin-login.setup
 */

import { expect } from "@playwright/test";

import { test } from "./console-log-fixture";

const adminUsername = process.env.PLAYWRIGHT_ADMIN_EMAIL || "";
const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD || "";
const basePath = process.env.VITE_BASE_PATH || "http://localhost:5173";

test("admin login setup", async ({ page }) => {
  await page.goto(`${basePath}/login`);
  await page.fill('input[name="username"]', adminUsername);
  await page.fill('input[name="password"]', adminPassword);
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  await expect(loginButton).toHaveText(/ログイン中/);
  await page.waitForURL(`${basePath}/`);
  await page.context().storageState({ path: "playwright/.auth/admin.json" });
});
