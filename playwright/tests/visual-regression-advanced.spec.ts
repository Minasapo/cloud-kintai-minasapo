import { expect, test } from "@playwright/test";

/**
 * 高度なビジュアルリグレッションテスト
 *
 * 目的:
 * - 特定コンポーネントの詳細なビジュアル検証
 * - レイアウト崩れの検出
 * - フォーム入力時の状態変化を検証
 * - レスポンシブデザインの複数サイズ検証
 * - カラースキームやダーク/ライトモードの検証
 *
 * 実行方法:
 * - スタッフユーザー: npm run test:e2e -- visual-regression-advanced --project=chromium-staff
 * - 管理者ユーザー: npm run test:e2e -- visual-regression-advanced --project=chromium-admin
 */

/**
 * コンポーネント単位でスクリーンショットを取得
 */
async function screenshotElement(
  page: any,
  selector: string,
  filename: string,
  options: any = {}
) {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible" });

  await expect(element).toHaveScreenshot(filename, {
    maxDiffPixels: 50,
    ...options,
  });
}

/**
 * 複数のビューポートサイズでテスト実行
 * iPhone 12 Proとデスクトップ
 */
const VIEWPORT_SIZES = [
  { width: 390, height: 844, name: "mobile" }, // iPhone 12 Pro
  { width: 1440, height: 900, name: "desktop" }, // デスクトップ
];

test.describe("高度なビジュアルリグレッション - コンポーネント検証", () => {
  test.describe("UI コンポーネント検証", () => {
    test("ヘッダーコンポーネント - 複数状態", async ({ page }) => {
      await page.goto("/attendance/list");
      await page.waitForLoadState("networkidle");

      // ヘッダー領域のスクリーンショット
      const header = page.locator("header, nav, [role='banner']").first();
      await expect(header).toHaveScreenshot("component-header.png", {
        maxDiffPixels: 30,
      });
    });

    test("サイドバーナビゲーション - 開閉状態", async ({ page }) => {
      await page.goto("/attendance/list");
      await page.waitForLoadState("networkidle");

      // サイドバーのスクリーンショット
      const sidebar = page.locator("aside, [role='navigation']").first();
      if (await sidebar.isVisible()) {
        await expect(sidebar).toHaveScreenshot("component-sidebar-open.png", {
          maxDiffPixels: 50,
        });
      }

      // サイドバーが閉じられるボタンがあれば閉じる
      const closeButton = page
        .locator("button[aria-label*='Close'], button[aria-label*='Menu']")
        .first();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(500); // アニメーション待機
        await expect(sidebar).toHaveScreenshot("component-sidebar-closed.png", {
          maxDiffPixels: 50,
        });
      }
    });

    test("テーブル/リスト要素 - データ表示", async ({ page }) => {
      await page.goto("/attendance/list");
      await page.waitForLoadState("networkidle");

      // テーブルのスクリーンショット
      const table = page
        .locator("table, [role='table'], [role='grid']")
        .first();
      if (await table.isVisible()) {
        await expect(table).toHaveScreenshot("component-table.png", {
          maxDiffPixels: 100,
        });
      }
    });

    test("フォームコンポーネント - 複数の入力状態", async ({ page }) => {
      await page.goto("/attendance/report");
      await page.waitForLoadState("networkidle");

      // フォームセクションのスクリーンショット
      const form = page.locator("form, [role='form']").first();
      if (await form.isVisible()) {
        await expect(form).toHaveScreenshot("component-form-empty.png", {
          maxDiffPixels: 75,
        });

        // フォームに値を入力してスクリーンショット
        const inputs = await page
          .locator(
            "input:not([readonly]):not([aria-readonly='true']), textarea:not([readonly]):not([aria-readonly='true']), select:not([disabled])"
          )
          .all();
        let filledCount = 0;
        for (const input of inputs) {
          if (!(await input.isVisible()) || !(await input.isEditable())) {
            continue;
          }

          const type = await input.getAttribute("type");

          if (type === "text" || type === "email") {
            await input.fill("テスト入力");
          } else if (type === "date") {
            await input.fill("2024-01-15");
          } else if (type === "checkbox" || type === "radio") {
            await input.check({ force: true });
          }

          filledCount += 1;
          if (filledCount >= 2) break;
        }

        await page.waitForTimeout(300);
        await expect(form).toHaveScreenshot("component-form-filled.png", {
          maxDiffPixels: 75,
          animations: "disabled",
        });
      }
    });

    test("モーダル/ダイアログ検証", async ({ page }) => {
      await page.goto("/admin/staff");
      await page.waitForLoadState("networkidle");

      // モーダルを開くボタンを探して押す
      const createButton = page
        .locator("button")
        .filter({ hasText: /追加|新規|作成|Create|Add/i })
        .first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(500);

        // モーダルのスクリーンショット
        const modal = page
          .locator(
            "[role='dialog'], .modal, .dialog, [class*='Modal'], [class*='Dialog']"
          )
          .first();

        if (await modal.isVisible()) {
          await expect(modal).toHaveScreenshot("component-modal.png", {
            maxDiffPixels: 100,
          });
        }
      }
    });

    test("ボタン & 状態表示コンポーネント", async ({ page }) => {
      await page.goto("/attendance/list");
      await page.waitForLoadState("networkidle");

      // ボタングループのスクリーンショット
      const buttons = page.locator("button").first();
      if (await buttons.isVisible()) {
        await expect(page).toHaveScreenshot("component-buttons.png", {
          mask: [page.locator("main, [role='main']")], // main 要素のみをマスク
          maxDiffPixels: 100,
        });
      }
    });
  });

  test.describe("レスポンシブデザイン - 複数ビューポート", () => {
    for (const viewport of VIEWPORT_SIZES) {
      test(`勤怠一覧 - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await page.goto("/attendance/list");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(
          `responsive-attendance-${viewport.name}.png`,
          {
            fullPage: true,
            maxDiffPixels: 150,
          }
        );
      });

      test(`ワークフロー一覧 - ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await page.goto("/workflow");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(
          `responsive-workflow-${viewport.name}.png`,
          {
            fullPage: true,
            maxDiffPixels: 150,
          }
        );
      });
    }
  });

  test.describe("スクロール状態の検証", () => {
    test("ページスクロール - 中途位置のスクリーンショット", async ({
      page,
    }) => {
      await page.goto("/admin/daily-report");
      await page.waitForLoadState("networkidle");

      // スクロール位置を設定
      await page.evaluate(() => {
        window.scrollBy(0, 300);
      });

      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot("scroll-position-middle.png", {
        fullPage: false, // 現在のビューポートのみ
        maxDiffPixels: 75,
      });

      // 下部へスクロール
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });

      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot("scroll-position-bottom.png", {
        fullPage: false,
        maxDiffPixels: 75,
      });
    });
  });

  test.describe("インタラクティブ要素の状態検証", () => {
    test("ホバー状態の検証（ボタン）", async ({ page }) => {
      await page.goto("/attendance/list");
      await page.waitForLoadState("networkidle");

      const button = page
        .locator("button")
        .filter({ hasText: /編集|Edit|登録/i })
        .first();

      if (await button.isVisible()) {
        // ノーマル状態
        await expect(page).toHaveScreenshot("button-normal.png", {
          fullPage: false,
          maxDiffPixels: 100,
        });

        // ホバー状態
        await button.hover();
        await page.waitForTimeout(200);

        await expect(page).toHaveScreenshot("button-hover.png", {
          fullPage: false,
          maxDiffPixels: 100,
        });
      }
    });

    test("フォーカス状態の検証", async ({ page }) => {
      await page.goto("/attendance/report");
      await page.waitForLoadState("networkidle");

      const input = page.locator("input, select, textarea").first();

      if (await input.isVisible()) {
        // フォーカス前
        await expect(page).toHaveScreenshot("input-unfocused.png", {
          fullPage: false,
          maxDiffPixels: 75,
        });

        // フォーカス後
        await input.focus();
        await page.waitForTimeout(200);

        await expect(page).toHaveScreenshot("input-focused.png", {
          fullPage: false,
          maxDiffPixels: 75,
        });
      }
    });

    test("チェックボックス & ラジオボタン状態", async ({ page }) => {
      await page.goto("/attendance/report");
      await page.waitForLoadState("networkidle");

      const checkboxes = page.locator("input[type='checkbox']").all();
      const radioButtons = page.locator("input[type='radio']").all();

      // チェックボックス検証
      const cbList = await checkboxes;
      if (cbList.length > 0) {
        await expect(page).toHaveScreenshot("checkbox-unchecked.png", {
          fullPage: false,
          maxDiffPixels: 50,
        });

        await cbList[0].check({ force: true });
        await page.waitForTimeout(200);

        await expect(page).toHaveScreenshot("checkbox-checked.png", {
          fullPage: false,
          maxDiffPixels: 50,
        });
      }

      // ラジオボタン検証
      const rbList = await radioButtons;
      if (rbList.length > 1) {
        await expect(page).toHaveScreenshot("radio-unselected.png", {
          fullPage: false,
          maxDiffPixels: 50,
        });

        await rbList[0].check({ force: true });
        await page.waitForTimeout(200);

        await expect(page).toHaveScreenshot("radio-selected.png", {
          fullPage: false,
          maxDiffPixels: 50,
        });
      }
    });
  });

  test.describe("エラー & 成功状態の検証", () => {
    test("エラーメッセージ表示", async ({ page }) => {
      await page.goto("/attendance/report");
      await page.waitForLoadState("networkidle");

      // フォーム送信ボタンをクリック（空の状態で）
      const submitButton = page
        .locator("button")
        .filter({ hasText: /送信|Submit|Save/i })
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);

        // エラーメッセージ表示の検証
        const errorContainer = page.locator(
          "[role='alert'], .error, .alert-error, [class*='Error']"
        );

        if (await errorContainer.first().isVisible()) {
          await expect(page).toHaveScreenshot("form-errors.png", {
            fullPage: false,
            maxDiffPixels: 75,
          });
        }
      }
    });
  });

  test.describe("マスキング & クリッピング", () => {
    test("特定要素をマスク（動的コンテンツ）", async ({ page }) => {
      await page.goto("/attendance/list");
      await page.waitForLoadState("networkidle");

      // 時刻やタイムスタンプなど動的コンテンツをマスク
      const dynamicElements = page.locator("time, [data-timestamp]");

      await expect(page).toHaveScreenshot("page-with-masked-content.png", {
        fullPage: true,
        mask: [dynamicElements],
        maxDiffPixels: 100,
      });
    });

    test("特定要素のみを比較", async ({ page }) => {
      await page.goto("/attendance/list");
      await page.waitForLoadState("networkidle");

      const mainContent = page.locator("main, [role='main']");

      if (await mainContent.isVisible()) {
        await expect(mainContent).toHaveScreenshot("main-content-only.png", {
          maxDiffPixels: 100,
        });
      }
    });
  });

  test.describe("スクリーンショット & ファイル保存", () => {
    test("スクリーンショット - PNG形式で直接保存", async ({ page }) => {
      const paths = [
        { path: "/attendance/list", name: "attendance-list" },
        { path: "/attendance/stats", name: "attendance-stats" },
        { path: "/workflow", name: "workflow-list" },
      ];

      for (const item of paths) {
        await page.goto(item.path);
        await page.waitForLoadState("networkidle");

        const timestamp = Date.now();
        const filename = `playwright/tests/screenshots/${item.name}-${timestamp}.png`;

        // フルページスクリーンショット
        await page.screenshot({
          path: filename,
          fullPage: true,
        });

        console.log(`✅ Screenshot saved: ${filename}`);

        // ビューポートのみのスクリーンショット
        const viewportFilename = `playwright/tests/screenshots/${item.name}-viewport-${timestamp}.png`;
        await page.screenshot({
          path: viewportFilename,
          fullPage: false,
        });

        console.log(`✅ Viewport screenshot saved: ${viewportFilename}`);
      }
    });

    test("PDF として保存", async ({ page }) => {
      const paths = [
        { path: "/attendance/list", name: "attendance-list" },
        { path: "/attendance/stats", name: "attendance-stats" },
      ];

      for (const item of paths) {
        await page.goto(item.path);
        await page.waitForLoadState("networkidle");

        const timestamp = Date.now();
        const filename = `playwright/tests/screenshots/${item.name}-${timestamp}.pdf`;

        await page.pdf({
          path: filename,
          format: "A4",
          printBackground: true,
        });

        console.log(`✅ PDF saved: ${filename}`);
      }
    });
  });
});
