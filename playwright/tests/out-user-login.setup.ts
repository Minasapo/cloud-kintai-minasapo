/**
 * Playwright用のout-userログインセットアップスクリプト。
 *
 * - 環境変数 `PLAYWRIGHT_OUT_USER_EMAIL` および `PLAYWRIGHT_OUT_USER_PASSWORD` を使用してログインします。
 * - ログイン後、認証状態を `playwright/.auth/out-user.json` に保存します。
 *
 * @module out-user-login.setup
 */

import { expect } from "@playwright/test";

import { test } from "./console-log-fixture";

const outUserEmail = process.env.PLAYWRIGHT_OUT_USER_EMAIL || "";
const outUserPassword = process.env.PLAYWRIGHT_OUT_USER_PASSWORD || "";
const basePath = process.env.VITE_BASE_PATH || "http://localhost:5173";

test("out user login setup", async ({ page }) => {
  await page.goto(`${basePath}/login`);
  await page.fill('input[name="username"]', outUserEmail);
  await page.fill('input[name="password"]', outUserPassword);
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  await expect(loginButton).toHaveText(/ログイン中/);
  await page.waitForURL(`${basePath}/`);
  await page.context().storageState({ path: "playwright/.auth/out-user.json" });
});
