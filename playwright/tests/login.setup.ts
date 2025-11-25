/**
 * Playwright用のログインセットアップスクリプト。
 *
 * - 環境変数 `PLAYWRIGHT_LOGIN_EMAIL` および `PLAYWRIGHT_LOGIN_PASSWORD` を使用してログインします。
 * - ログイン後、認証状態を `playwright/.auth/user.json` に保存します。
 * - テスト実行時に自動でログイン状態を再現するために利用します。
 *
 * @module login.setup
 */

import { expect, test as base } from "@playwright/test";

export type LoginInfo = {
  username: string;
  password: string;
  storageStatePath: string;
};

export type Options = {
  config: string;
  loginInfo: LoginInfo;
  adminLoginInfo: LoginInfo;
  outStaffLoginInfo: LoginInfo;
  lazyUserLoginInfo: LoginInfo;
};

export const test = base.extend<Options & { basePath: string }>({
  basePath: [
    process.env.VITE_BASE_PATH || "http://localhost:5173",
    { option: true },
  ],
  loginInfo: [
    {
      username: process.env.PLAYWRIGHT_LOGIN_EMAIL || "",
      password: process.env.PLAYWRIGHT_LOGIN_PASSWORD || "",
      storageStatePath: "playwright/.auth/user.json",
    },
    { option: true },
  ],
  adminLoginInfo: [
    {
      username: process.env.PLAYWRIGHT_ADMIN_EMAIL || "",
      password: process.env.PLAYWRIGHT_ADMIN_PASSWORD || "",
      storageStatePath: "playwright/.auth/admin.json",
    },
    { option: true },
  ],
  outStaffLoginInfo: [
    {
      username: process.env.PLAYWRIGHT_OUT_USER_EMAIL || "",
      password: process.env.PLAYWRIGHT_OUT_USER_PASSWORD || "",
      storageStatePath: "playwright/.auth/out-user.json",
    },
    { option: true },
  ],
  lazyUserLoginInfo: [
    {
      username: process.env.PLAYWRIGHT_LAZY_USER_EMAIL || "",
      password: process.env.PLAYWRIGHT_LAZY_USER_PASSWORD || "",
      storageStatePath: "playwright/.auth/lazy-user.json",
    },
    { option: true },
  ],
});

test.describe.configure({ mode: "parallel" });

test.beforeEach(async ({ page, basePath }) => {
  await page.goto(`${basePath}/login`);
});

test.describe("スタッフ", () => {
  test("通常", async ({ page, basePath, loginInfo }) => {
    const { username, password } = loginInfo;

    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    await expect(loginButton).toHaveText(/ログイン中/);

    await page.waitForURL(`${basePath}/`);

    await page.context().storageState({ path: "playwright/.auth/user.json" });
  });

  test("直行/直帰", async ({ page, basePath, outStaffLoginInfo }) => {
    const { username, password } = outStaffLoginInfo;

    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    await expect(loginButton).toHaveText(/ログイン中/);

    await page.waitForURL(`${basePath}/`);

    await page
      .context()
      .storageState({ path: outStaffLoginInfo.storageStatePath });
  });

  test("怠惰", async ({ page, basePath, lazyUserLoginInfo }) => {
    const { username, password } = lazyUserLoginInfo;

    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);

    const loginButton = page.locator('button[type="submit"]');
    await loginButton.click();

    await expect(loginButton).toHaveText(/ログイン中/);

    await page.waitForURL(`${basePath}/`);

    await page
      .context()
      .storageState({ path: "playwright/.auth/lazy-user.json" });
  });
});

test("管理者", async ({ page, basePath, adminLoginInfo }) => {
  const { username, password } = adminLoginInfo;

  await page.fill('input[name="username"]', username);
  await page.fill('input[name="password"]', password);

  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();

  await expect(loginButton).toHaveText(/ログイン中/);

  await page.waitForURL(`${basePath}/`);

  await page.context().storageState({ path: adminLoginInfo.storageStatePath });
});
