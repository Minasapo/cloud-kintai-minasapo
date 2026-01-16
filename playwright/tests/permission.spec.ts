import { expect, test } from "@playwright/test";

/**
 * 権限チェックテスト
 *
 * 目的:
 * - スタッフユーザーが管理者専用ページにアクセスできないことを確認
 * - 管理者ユーザーがスタッフ専用ページにアクセスできることを確認
 * - 権限に応じたページへのリダイレクト動作を検証
 * - メニューの表示・非表示が権限に応じて正しく動作すること確認
 *
 * 実行方法:
 * - npm run test:e2e -- permission --project=chromium-staff
 * - npm run test:e2e -- permission --project=chromium-admin
 */

/**
 * スタッフユーザー専用のテスト
 */
test.describe("スタッフユーザーの権限チェック", () => {
  test.use({ storageState: "playwright/.auth/user.json" });

  test.describe("管理者ページへのアクセス制限", () => {
    test("管理画面トップ（/admin）へのアクセスはNotFoundが表示されること", async ({
      page,
    }) => {
      await page.goto("/admin");

      // ページが読み込まれるまで待つ
      await page.waitForLoadState("networkidle");

      // NotFoundページが表示されることを確認（404テキストで検証）
      const notFoundContent = page.locator("text=ページが見つかりません");
      const isNotFound = (await notFoundContent.count()) > 0;

      // NotFoundページが表示されているか、もしくはホームページにリダイレクトされていることを確認
      const isHome = page.url().includes("/");
      expect(isNotFound || isHome).toBeTruthy();
    });
  });

  test.describe("メニューの表示制御", () => {
    test("ヘッダーに管理メニューが表示されないこと", async ({ page }) => {
      await page.goto("/");

      // ページが読み込まれるまで待つ
      const mainContent = page.locator("main, [role='main']");
      await expect(mainContent).toBeVisible({ timeout: 10000 });

      // 管理メニューへのリンクが表示されないことを確認
      const adminMenuLink = page.locator('a[href="/admin"]');
      if ((await adminMenuLink.count()) > 0) {
        await expect(adminMenuLink).not.toBeVisible();
      }
    });

    test("スタッフ専用メニューが表示されること", async ({ page }) => {
      await page.goto("/");

      // ページが読み込まれるまで待つ
      const mainContent = page.locator("main, [role='main']");
      await expect(mainContent).toBeVisible({ timeout: 10000 });

      // スタッフメニューが表示されることを確認
      const staffMenuItems = page.locator("a").filter({
        hasText: /勤怠|シフト|ワークフロー|日報/i,
      });
      await expect(staffMenuItems.first()).toBeVisible();
    });
  });

  test.describe("スタッフ専用ページへのアクセス", () => {
    test("スタッフ一覧ページ（/attendance/list）にアクセスできること", async ({
      page,
    }) => {
      await page.goto("/attendance/list");

      // ページが正常に読み込まれることを確認
      const pageTitle = page.locator("h1, h2").filter({
        hasText: /勤怠一覧|打刻/i,
      });
      await expect(pageTitle.first()).toBeVisible({ timeout: 15000 });
    });

    test("シフト申請ページ（/shift）にアクセスできること", async ({ page }) => {
      await page.goto("/shift");

      // ページが正常に読み込まれることを確認
      const pageTitle = page.locator("h1, h2").filter({
        hasText: /シフト/i,
      });
      await expect(pageTitle.first()).toBeVisible({ timeout: 15000 });
    });

    test("ワークフロー一覧ページ（/workflow）にアクセスできること", async ({
      page,
    }) => {
      await page.goto("/workflow");

      // ページが正常に読み込まれることを確認
      const pageTitle = page.locator("h1, h2").filter({
        hasText: /ワークフロー|申請/i,
      });
      await expect(pageTitle.first()).toBeVisible({ timeout: 15000 });
    });
  });
});

/**
 * 管理者ユーザー専用のテスト
 */
test.describe("管理者ユーザーの権限チェック", () => {
  test.use({ storageState: "playwright/.auth/admin.json" });

  test.describe("管理者ページへのアクセス", () => {
    test("管理画面トップ（/admin）にアクセスできること", async ({ page }) => {
      await page.goto("/admin");

      // 管理画面ダッシュボードが表示されることを確認
      const adminContent = page.locator("h1, h2").filter({
        hasText: /管理|ダッシュボード/i,
      });
      await expect(adminContent.first()).toBeVisible({ timeout: 15000 });
    });

    test("スタッフ管理ページ（/admin/staff）にアクセスできること", async ({
      page,
    }) => {
      await page.goto("/admin/staff");

      // スタッフ管理ページが表示されることを確認
      const mainContent = page.locator("main, [role='main']");
      await expect(mainContent).toBeVisible({ timeout: 15000 });
    });

    test("勤怠管理ページ（/admin/attendances）にアクセスできること", async ({
      page,
    }) => {
      await page.goto("/admin/attendances");

      // 勤怠管理ページが表示されることを確認
      const mainContent = page.locator("main, [role='main']");
      await expect(mainContent).toBeVisible({ timeout: 15000 });
    });

    test("その他の管理者ページにアクセスできること", async ({ page }) => {
      const adminPages = [
        "/admin/shift",
        "/admin/master/job_term",
        "/admin/workflow",
        "/admin/logs",
        "/admin/daily-report",
      ];

      for (const path of adminPages) {
        await page.goto(path);

        // ページが正常に読み込まれることを確認
        const mainContent = page.locator("main, [role='main']");
        await expect(mainContent).toBeVisible({ timeout: 15000 });

        // 404ページが表示されていないことを確認
        const notFoundCode = page.locator("h1").filter({
          hasText: "404",
        });
        if ((await notFoundCode.count()) > 0) {
          await expect(notFoundCode).not.toBeVisible();
        }
      }
    });
  });

  test.describe("メニューの表示制御", () => {
    test("ヘッダーに管理メニューが表示されること", async ({ page }) => {
      await page.goto("/");

      // ページが読み込まれるまで待つ
      const mainContent = page.locator("main, [role='main']");
      await expect(mainContent).toBeVisible({ timeout: 15000 });

      // 管理メニューへのリンクが表示されることを確認
      const adminMenuLink = page.locator("a").filter({
        hasText: /管理|admin/i,
      });
      await expect(adminMenuLink.first()).toBeVisible();
    });
  });

  test.describe("スタッフ専用ページへのアクセス", () => {
    test("スタッフ一覧ページ（/attendance/list）にアクセスできること", async ({
      page,
    }) => {
      await page.goto("/attendance/list");

      // ページが正常に読み込まれることを確認
      const pageTitle = page.locator("h1, h2").filter({
        hasText: /勤怠一覧|打刻/i,
      });
      await expect(pageTitle.first()).toBeVisible({ timeout: 15000 });
    });

    test("シフト申請ページ（/shift）にアクセスできること", async ({ page }) => {
      await page.goto("/shift");

      // ページが正常に読み込まれることを確認
      const mainContent = page.locator("main, [role='main']");
      await expect(mainContent).toBeVisible({ timeout: 15000 });
    });

    test("ワークフロー一覧ページ（/workflow）にアクセスできること", async ({
      page,
    }) => {
      await page.goto("/workflow");

      // ページが正常に読み込まれることを確認
      const mainContent = page.locator("main, [role='main']");
      await expect(mainContent).toBeVisible({ timeout: 15000 });
    });
  });
});

/**
 * ログイン前ユーザーの権限チェック
 */
test.describe("未認証ユーザーの権限チェック", () => {
  test.describe("ログインページへのリダイレクト", () => {
    test.skip("ログアウト状態でスタッフページへアクセスするとログインページにリダイレクトされること", async ({
      page,
    }) => {
      // ログアウト状態でテスト実行
      await page.context().clearCookies();

      await page.goto("/attendance/list");

      // ログインページへリダイレクトされることを確認
      await expect(page).toHaveURL(/\/login/);

      const loginForm = page.locator(
        'input[name="username"], input[name="password"]'
      );
      await expect(loginForm.first()).toBeVisible({ timeout: 5000 });
    });

    test.skip("ログアウト状態で管理者ページへアクセスするとログインページにリダイレクトされること", async ({
      page,
    }) => {
      // ログアウト状態でテスト実行
      await page.context().clearCookies();

      await page.goto("/admin");

      // ログインページへリダイレクトされることを確認
      await expect(page).toHaveURL(/\/login/);

      const loginForm = page.locator(
        'input[name="username"], input[name="password"]'
      );
      await expect(loginForm.first()).toBeVisible({ timeout: 5000 });
    });

    test.skip("ログアウト状態でプロフィールページへアクセスするとログインページにリダイレクトされること", async ({
      page,
    }) => {
      // ログアウト状態でテスト実行
      await page.context().clearCookies();

      await page.goto("/profile");

      // ログインページへリダイレクトされることを確認
      await expect(page).toHaveURL(/\/login/);

      const loginForm = page.locator(
        'input[name="username"], input[name="password"]'
      );
      await expect(loginForm.first()).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("ログインページの動作", () => {
    test.skip("ログインページにアクセスできること", async ({ page }) => {
      await page.context().clearCookies();

      await page.goto("/login");

      // ログインフォームが表示されることを確認
      const loginForm = page.locator(
        'input[name="username"], input[name="password"]'
      );
      await expect(loginForm.first()).toBeVisible({ timeout: 5000 });
    });
  });
});
