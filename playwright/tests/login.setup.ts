/**
 * Playwright用のログインセットアップスクリプト。
 *
 * - 環境変数 `PLAYWRIGHT_LOGIN_EMAIL` および `PLAYWRIGHT_LOGIN_PASSWORD` を使用してログインします。
 * - ログイン後、認証状態を `playwright/.auth/user.json` に保存します。
 *
 * @module login.setup
 */

import { expect } from "@playwright/test";

import { test } from "./console-log-fixture";

const username = process.env.PLAYWRIGHT_LOGIN_EMAIL || "";
const password = process.env.PLAYWRIGHT_LOGIN_PASSWORD || "";
const basePath = process.env.VITE_BASE_PATH || "http://localhost:5173";

test("login setup", async ({ page }) => {
  await page.goto(`${basePath}/login`);
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  await expect(loginButton).toHaveText(/ログイン中/);
  await page.waitForURL(`${basePath}/`);
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
