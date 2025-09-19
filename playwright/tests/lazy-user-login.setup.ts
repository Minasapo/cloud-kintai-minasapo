/**
 * Playwright用のlazy-userログインセットアップスクリプト。
 *
 * - 環境変数 `PLAYWRIGHT_LAZY_USER_EMAIL` および `PLAYWRIGHT_LAZY_USER_PASSWORD` を使用してログインします。
 * - ログイン後、認証状態を `playwright/.auth/lazy-user.json` に保存します。
 *
 * @module lazy-user-login.setup
 */

import { expect } from "@playwright/test";

import { test } from "./console-log-fixture";

const lazyUserEmail = process.env.PLAYWRIGHT_LAZY_USER_EMAIL || "";
const lazyUserPassword = process.env.PLAYWRIGHT_LAZY_USER_PASSWORD || "";
const basePath = process.env.VITE_BASE_PATH || "http://localhost:5173";

test("lazy user login setup", async ({ page }) => {
  await page.goto(`${basePath}/login`);
  await page.fill('input[name="username"]', lazyUserEmail);
  await page.fill('input[name="password"]', lazyUserPassword);
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  await expect(loginButton).toHaveText(/ログイン中/);
  await page.waitForURL(`${basePath}/`);
  await page
    .context()
    .storageState({ path: "playwright/.auth/lazy-user.json" });
});
