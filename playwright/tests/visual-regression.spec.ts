import { devices, expect, test } from "@playwright/test";

import { ADMIN_TEST_PAGES, STAFF_TEST_PAGES } from "./visual-regression.config";

/**
 * ビジュアルリグレッションテスト: 画面全体のスクリーンショット検証
 *
 * 目的:
 * - UIの不意な変更を検出
 * - レイアウトやスタイルの回帰をキャッチ
 * - 画面全体のスナップショット比較
 * - レスポンシブデザインの検証
 *
 * 実行方法:
 * - スタッフユーザー: npm run test:e2e -- visual-regression --project=chromium-staff
 * - 管理者ユーザー: npm run test:e2e -- visual-regression --project=chromium-admin
 *
 * 初回実行（ベースラインキャプチャ）:
 * - npm run test:e2e -- visual-regression --project=chromium-staff --update-snapshots
 * - npm run test:e2e -- visual-regression --project=chromium-admin --update-snapshots
 *
 * ベースラインは下記に保存されます:
 * - playwright/tests/visual-regression/ (スクリーンショット)
 * - __snapshots__/visual-regression.spec.ts-snapshots/ (ビジュアル期待値)
 */

/**
 * ページが完全にロードされるまで待機する
 */
async function waitForPageReady(page: any) {
  // ページの読み込み完了を待つ
  await page.waitForLoadState("networkidle");

  // アニメーションやローディングスピナーが完了するまで追加で待機
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      // すべてのアニメーションが完了するまで待機
      const startTime = Date.now();
      const maxWait = 3000; // 最大3秒待機

      const checkAnimations = () => {
        if (Date.now() - startTime > maxWait) {
          resolve();
          return;
        }

        // MutationObserverでDOM変更を監視（レイアウトシフトを検出）
        let mutationDetected = false;
        const observer = new MutationObserver(() => {
          mutationDetected = true;
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["style", "class"],
        });

        setTimeout(() => {
          observer.disconnect();
          if (mutationDetected) {
            checkAnimations();
          } else {
            resolve();
          }
        }, 500);
      };

      checkAnimations();
    });
  });
}

/**
 * スクリーンショット取得時に必要な調整を行う
 */
async function preparePageForScreenshot(page: any) {
  // ホバー状態を解除
  await page.evaluate(() => {
    document.body.style.pointerEvents = "none";
    setTimeout(() => {
      document.body.style.pointerEvents = "auto";
    }, 100);
  });

  // キャレットを非表示（フォーカス状態の点滅を回避）
  await page.addStyleTag({
    content: `
      input:focus, textarea:focus, select:focus {
        outline: none !important;
      }
      * {
        caret-color: transparent !important;
      }
    `,
  });
}

test.describe("ビジュアルリグレッション - 画面全体スクリーンショット", () => {
  // スタッフユーザー向けテスト
  test.describe("スタッフユーザー", () => {
    for (const page of STAFF_TEST_PAGES) {
      test(`${page.name} (${page.path}) - 画面全体`, async ({
        page: playwrightPage,
      }) => {
        if (page.path === "/register") {
          await playwrightPage.addInitScript(() => {
            const fixed = new Date("2024-01-13T12:00:00Z").valueOf();
            const OriginalDate = Date;
            class MockDate extends OriginalDate {
              constructor(...args: any[]) {
                if (args.length === 0) {
                  super(fixed);
                } else {
                  super(...args);
                }
              }
              static now() {
                return fixed;
              }
            }
            // @ts-ignore
            globalThis.Date = MockDate;
          });
        }

        // ページナビゲート
        await playwrightPage.goto(page.path);

        // ページロード完了まで待機
        await waitForPageReady(playwrightPage);

        // スクリーンショット準備
        await preparePageForScreenshot(playwrightPage);

        const masks = [] as any[];
        if (page.path === "/register") {
          const clock = playwrightPage
            .locator(
              "[data-testid='clock'], [data-testid='time'], .clock, .time-display, [class*='clock']"
            )
            .first();
          masks.push(clock);
        }

        // フルページスクリーンショットで検証
        await expect(playwrightPage).toHaveScreenshot(
          `staff-${page.path.replace(/\//g, "-")}-full.png`,
          {
            fullPage: true,
            maxDiffPixels: 100, // 許容差異ピクセル数
            mask: masks,
          }
        );
      });

      // ビューポートスクリーンショット（ファーストビュー）も取得
      test(`${page.name} (${page.path}) - ファーストビュー`, async ({
        page: playwrightPage,
      }) => {
        if (page.path === "/register") {
          await playwrightPage.addInitScript(() => {
            const fixed = new Date("2024-01-13T12:00:00Z").valueOf();
            const OriginalDate = Date;
            class MockDate extends OriginalDate {
              constructor(...args: any[]) {
                if (args.length === 0) {
                  super(fixed);
                } else {
                  super(...args);
                }
              }
              static now() {
                return fixed;
              }
            }
            // @ts-ignore
            globalThis.Date = MockDate;
          });
        }

        await playwrightPage.goto(page.path);
        await waitForPageReady(playwrightPage);
        await preparePageForScreenshot(playwrightPage);

        const masks = [] as any[];
        if (page.path === "/register") {
          const clock = playwrightPage
            .locator(
              "[data-testid='clock'], [data-testid='time'], .clock, .time-display, [class*='clock']"
            )
            .first();
          masks.push(clock);
        }

        // ビューポート領域のみのスクリーンショット
        await expect(playwrightPage).toHaveScreenshot(
          `staff-${page.path.replace(/\//g, "-")}-viewport.png`,
          {
            fullPage: false,
            maxDiffPixels: 50,
            mask: masks,
          }
        );
      });
    }
  });

  // 管理者ユーザー向けテスト
  test.describe("管理者ユーザー", () => {
    for (const page of ADMIN_TEST_PAGES) {
      test(`${page.name} (${page.path}) - 画面全体`, async ({
        page: playwrightPage,
      }, testInfo) => {
        test.skip(
          testInfo.project.name === "chromium-staff",
          "スタッフ権限ではスキップ"
        );

        await playwrightPage.goto(page.path);
        await waitForPageReady(playwrightPage);
        await preparePageForScreenshot(playwrightPage);

        await expect(playwrightPage).toHaveScreenshot(
          `admin-${page.path.replace(/\//g, "-")}-full.png`,
          {
            fullPage: true,
            maxDiffPixels: 100,
          }
        );
      });

      test(`${page.name} (${page.path}) - ファーストビュー`, async ({
        page: playwrightPage,
      }, testInfo) => {
        test.skip(
          testInfo.project.name === "chromium-staff",
          "スタッフ権限ではスキップ"
        );

        await playwrightPage.goto(page.path);
        await waitForPageReady(playwrightPage);
        await preparePageForScreenshot(playwrightPage);

        await expect(playwrightPage).toHaveScreenshot(
          `admin-${page.path.replace(/\//g, "-")}-viewport.png`,
          {
            fullPage: false,
            maxDiffPixels: 50,
          }
        );
      });
    }
  });

  // レスポンシブデザイン検証（デスクトップとモバイル）
  test.describe("レスポンシブデザイン検証 - モバイル (iPhone 12 Pro)", () => {
    test("勤怠一覧 - モバイル表示", async ({ page: playwrightPage }) => {
      // iPhone 12 Proのビューポートとユーザーエージェントを設定
      await playwrightPage.setViewportSize(devices["iPhone 12 Pro"].viewport);
      await playwrightPage.context().addInitScript(() => {
        Object.defineProperty(navigator, "userAgent", {
          get: () =>
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        });
      });

      await playwrightPage.goto("/attendance/list");
      await waitForPageReady(playwrightPage);

      // ビューポート変更後のレイアウト調整を待つ
      await playwrightPage.waitForTimeout(1000);

      // ビューポートサイズを確認（デバッグ用）
      const viewport = playwrightPage.viewportSize();
      console.log(
        `📱 モバイルビューポート: ${viewport?.width}x${viewport?.height}`
      );

      await preparePageForScreenshot(playwrightPage);

      await expect(playwrightPage).toHaveScreenshot(
        "staff-attendance-mobile.png",
        {
          fullPage: true,
          maxDiffPixels: 100,
        }
      );
    });

    test("ワークフロー一覧 - モバイル表示", async ({
      page: playwrightPage,
    }) => {
      // iPhone 12 Proのビューポートとユーザーエージェントを設定
      await playwrightPage.setViewportSize(devices["iPhone 12 Pro"].viewport);
      await playwrightPage.context().addInitScript(() => {
        Object.defineProperty(navigator, "userAgent", {
          get: () =>
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        });
      });

      await playwrightPage.goto("/workflow");
      await waitForPageReady(playwrightPage);

      // ビューポート変更後のレイアウト調整を待つ
      await playwrightPage.waitForTimeout(1000);

      // ビューポートサイズを確認（デバッグ用）
      const viewport = playwrightPage.viewportSize();
      console.log(
        `📱 モバイルビューポート: ${viewport?.width}x${viewport?.height}`
      );

      await preparePageForScreenshot(playwrightPage);

      await expect(playwrightPage).toHaveScreenshot(
        "staff-workflow-mobile.png",
        {
          fullPage: true,
          maxDiffPixels: 100,
        }
      );
    });
  });

  test.describe("レスポンシブデザイン検証 - デスクトップ", () => {
    test("勤怠一覧 - デスクトップ表示", async ({ page: playwrightPage }) => {
      // デスクトップビューポートに設定
      await playwrightPage.setViewportSize({ width: 1440, height: 900 });

      await playwrightPage.goto("/attendance/list");
      await waitForPageReady(playwrightPage);
      await preparePageForScreenshot(playwrightPage);

      await expect(playwrightPage).toHaveScreenshot(
        "staff-attendance-desktop.png",
        {
          fullPage: true,
          maxDiffPixels: 100,
        }
      );
    });

    test("ワークフロー一覧 - デスクトップ表示", async ({
      page: playwrightPage,
    }) => {
      // デスクトップビューポートに設定
      await playwrightPage.setViewportSize({ width: 1440, height: 900 });

      await playwrightPage.goto("/workflow");
      await waitForPageReady(playwrightPage);
      await preparePageForScreenshot(playwrightPage);

      await expect(playwrightPage).toHaveScreenshot(
        "staff-workflow-desktop.png",
        {
          fullPage: true,
          maxDiffPixels: 100,
        }
      );
    });
  });

  // スクリーンショット + ファイル保存（デバッグ用）
  test("スクリーンショット + ファイル保存（デバッグ）", async ({
    page: playwrightPage,
  }) => {
    const testPages = [
      { path: "/attendance/list", name: "staff-attendance" },
      { path: "/workflow", name: "staff-workflow" },
    ];

    for (const testPage of testPages) {
      await playwrightPage.goto(testPage.path);
      await waitForPageReady(playwrightPage);
      await preparePageForScreenshot(playwrightPage);

      // スクリーンショットをファイルとして保存
      const filename = `playwright/tests/screenshots/${
        testPage.name
      }-${Date.now()}.png`;
      await playwrightPage.screenshot({
        path: filename,
        fullPage: true,
      });

      console.log(`Screenshot saved: ${filename}`);
    }
  });
});
