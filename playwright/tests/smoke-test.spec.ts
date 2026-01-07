import { expect, test } from "@playwright/test";

/**
 * スモークテスト: 全ページエラー検出
 *
 * 目的:
 * - 全主要ページへのナビゲーション確認
 * - JavaScriptコンソールエラーの検出
 * - サーバーエラー（5xx）の検出
 * - ページロードの完了確認
 *
 * 実行方法:
 * - スタッフユーザー: npm run test:e2e -- smoke-test --project=chromium-staff
 * - 管理者ユーザー: npm run test:e2e -- smoke-test --project=chromium-admin
 */

// テスト対象ページのリスト（スタッフユーザー向け）
const STAFF_PAGES = [
  { path: "/attendance/list", name: "勤怠一覧" },
  { path: "/attendance/stats", name: "勤怠統計" },
  { path: "/attendance/report", name: "日報" },
  { path: "/workflow", name: "ワークフロー一覧" },
  { path: "/shift", name: "シフト申請" },
  { path: "/office", name: "オフィスホーム" },
  { path: "/profile", name: "プロフィール" },
];

// テスト対象ページのリスト（管理者ユーザー向け）
const ADMIN_PAGES = [
  { path: "/admin", name: "管理画面ダッシュボード" },
  { path: "/admin/staff", name: "スタッフ管理" },
  { path: "/admin/attendances", name: "勤怠管理" },
  { path: "/admin/shift", name: "シフト管理" },
  { path: "/admin/shift-plan", name: "シフトプラン管理" },
  { path: "/admin/master/job_term", name: "職位管理" },
  { path: "/admin/master/holiday_calendar", name: "祝日カレンダー" },
  { path: "/admin/workflow", name: "ワークフロー管理" },
  { path: "/admin/logs", name: "操作ログ" },
  { path: "/admin/daily-report", name: "日報管理" },
];

test.describe("スモークテスト - ページエラー検出", () => {
  // ページごとにエラーを収集
  const collectErrorsForPage = (page: any) => {
    const errors = {
      console: [] as string[],
      network: [] as string[],
      pageErrors: [] as Error[],
    };

    // コンソールエラーをキャッチ（リソースロードエラーは除外）
    page.on("console", (msg: any) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // リソースロードエラー（400系）は除外
        if (
          !text.includes("status of 400") &&
          !text.includes("status of 404")
        ) {
          errors.console.push(text);
        }
      }
    });

    // ネットワークエラー（5xx）をキャッチ
    page.on("response", (response: any) => {
      const status = response.status();
      if (status >= 500) {
        errors.network.push(`[${status}] ${response.url()}`);
      }
    });

    // グローバルエラーをキャッチ
    page.on("pageerror", (error: Error) => {
      errors.pageErrors.push(error);
    });

    return errors;
  };

  test.describe("スタッフユーザー - ページナビゲーション", () => {
    STAFF_PAGES.forEach(({ path, name }) => {
      test(`${name} (${path})`, async ({ page }) => {
        const errors = collectErrorsForPage(page);

        // ページへナビゲート
        await page.goto(path, { waitUntil: "networkidle" });

        // ローディング完了を待つ
        try {
          const loading = page.getByTestId("layout-linear-progress");
          await expect(loading).toBeHidden({ timeout: 10000 });
        } catch (e) {
          // ローディング要素がない場合はスキップ
        }

        // ページが正常に表示されていることを確認
        const bodyElement = page.locator("body");
        await expect(bodyElement).toBeVisible();

        // JavaScriptエラーがないことを確認
        expect(errors.console.length).toBe(
          0,
          `JavaScriptコンソールエラーが検出されました: ${errors.console.join(
            ", "
          )}`
        );

        // サーバーエラーがないことを確認
        expect(errors.network.length).toBe(
          0,
          `サーバーエラーが検出されました: ${errors.network.join(", ")}`
        );

        // グローバルエラーがないことを確認
        expect(errors.pageErrors.length).toBe(
          0,
          `ページエラーが検出されました: ${errors.pageErrors
            .map((e) => e.message)
            .join(", ")}`
        );
      });
    });
  });

  test.describe("管理者ユーザー - ページナビゲーション", () => {
    ADMIN_PAGES.forEach(({ path, name }) => {
      test(`${name} (${path})`, async ({ page }) => {
        const errors = collectErrorsForPage(page);

        // ページへナビゲート
        await page.goto(path, { waitUntil: "networkidle" });

        // ローディング完了を待つ
        try {
          const loading = page.getByTestId("layout-linear-progress");
          await expect(loading).toBeHidden({ timeout: 10000 });
        } catch (e) {
          // ローディング要素がない場合はスキップ
        }

        // ページが正常に表示されていることを確認
        const bodyElement = page.locator("body");
        await expect(bodyElement).toBeVisible();

        // JavaScriptエラーがないことを確認
        expect(errors.console.length).toBe(
          0,
          `JavaScriptコンソールエラーが検出されました: ${errors.console.join(
            ", "
          )}`
        );

        // サーバーエラーがないことを確認
        expect(errors.network.length).toBe(
          0,
          `サーバーエラーが検出されました: ${errors.network.join(", ")}`
        );

        // グローバルエラーがないことを確認
        expect(errors.pageErrors.length).toBe(
          0,
          `ページエラーが検出されました: ${errors.pageErrors
            .map((e) => e.message)
            .join(", ")}`
        );
      });
    });
  });

  test.describe("エラーケースの確認", () => {
    test("JavaScriptグローバルエラーハンドリング", async ({ page }) => {
      const errors = collectErrorsForPage(page);

      await page.goto("/attendance/list", { waitUntil: "networkidle" });

      // 意図しないグローバルエラーが発生していないことを確認
      expect(errors.pageErrors.length).toBe(
        0,
        "グローバルエラーが発生しました"
      );
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // テスト失敗時にスクリーンショットを取得
    if (testInfo.status !== "passed") {
      const testName = testInfo.title.replace(/[/\\?*:|"<>]/g, "-");
      await page.screenshot({
        path: `test-results/smoke-test-${testName}.png`,
      });
    }
  });
});
