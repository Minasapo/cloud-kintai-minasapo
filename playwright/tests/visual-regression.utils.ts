/**
 * ビジュアルリグレッションテスト用のユーティリティ関数
 */

import { expect, Page } from "@playwright/test";

/**
 * ページが完全にロードされるまで待機する
 * @param page Playwright Page インスタンス
 * @param maxWaitMs 最大待機時間（ミリ秒）
 */
export async function waitForPageReady(
  page: Page,
  maxWaitMs: number = 3000
): Promise<void> {
  // ネットワークの読み込み完了を待つ
  await page.waitForLoadState("networkidle", { timeout: maxWaitMs });

  // アニメーション完了を待つ
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const maxWait = 3000;

      const checkAnimations = () => {
        if (Date.now() - startTime > maxWait) {
          resolve();
          return;
        }

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
 * ページをスクリーンショット用に準備する
 * （ホバー状態を解除、キャレット非表示化など）
 * @param page Playwright Page インスタンス
 */
export async function preparePageForScreenshot(page: Page): Promise<void> {
  // ポインター操作を一時的に無効化（ホバー状態を解除）
  await page.evaluate(() => {
    document.body.style.pointerEvents = "none";
  });

  // スタイルを追加（フォーカス状態とキャレットを非表示）
  await page.addStyleTag({
    content: `
      input:focus, textarea:focus, select:focus {
        outline: none !important;
        box-shadow: none !important;
      }
      * {
        caret-color: transparent !important;
      }
      /* アニメーション/トランジションを即座に適用 */
      * {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
      }
    `,
  });

  // スクロール位置をリセット
  await page.evaluate(() => {
    window.scrollTo(0, 0);
  });
}

/**
 * スクリーンショットオプションのデフォルト設定
 */
export const DEFAULT_SCREENSHOT_OPTIONS = {
  fullPage: {
    maxDiffPixels: 100,
    threshold: 0.2,
  },
  viewport: {
    maxDiffPixels: 50,
    threshold: 0.2,
  },
  component: {
    maxDiffPixels: 30,
    threshold: 0.15,
  },
};

/**
 * 複数のビューポートサイズ定義
 */
export const VIEWPORT_PRESETS = {
  mobile: { width: 375, height: 667, name: "mobile" },
  mobileLand: { width: 667, height: 375, name: "mobile-landscape" },
  tablet: { width: 768, height: 1024, name: "tablet" },
  tabletLand: { width: 1024, height: 768, name: "tablet-landscape" },
  desktop: { width: 1440, height: 900, name: "desktop" },
  desktopLarge: { width: 1920, height: 1080, name: "desktop-large" },
};

/**
 * ページロード → 準備 → スクリーンショット の一連の処理
 */
export async function captureFullPageScreenshot(
  page: Page,
  path: string,
  screenshotName: string,
  options: any = {}
): Promise<void> {
  await page.goto(path);
  await waitForPageReady(page);
  await preparePageForScreenshot(page);

  await expect(page).toHaveScreenshot(screenshotName, {
    fullPage: true,
    ...DEFAULT_SCREENSHOT_OPTIONS.fullPage,
    ...options,
  });
}

/**
 * コンポーネント単位のスクリーンショット
 */
export async function captureComponentScreenshot(
  page: Page,
  selector: string,
  screenshotName: string,
  options: any = {}
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible", timeout: 5000 });

  await expect(element).toHaveScreenshot(screenshotName, {
    ...DEFAULT_SCREENSHOT_OPTIONS.component,
    ...options,
  });
}

/**
 * 要素が安定するまで待機（DOMの変更が落ち着くまで）
 */
export async function waitForElementStability(
  page: Page,
  selector: string,
  timeoutMs: number = 5000
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible", timeout: timeoutMs });

  // DOM変更がないまで安定した状態を待機
  await page.evaluate(async (sel) => {
    const elem = document.querySelector(sel);
    if (!elem) return;

    return new Promise<void>((resolve) => {
      let lastChange = Date.now();
      const stabilityTimeout = 500; // 500ms 安定していたら OK
      const maxWait = 5000; // 最大 5秒待機

      const observer = new MutationObserver(() => {
        lastChange = Date.now();
      });

      observer.observe(elem, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      });

      const checkStability = setInterval(() => {
        if (
          Date.now() - lastChange > stabilityTimeout ||
          Date.now() > lastChange + maxWait
        ) {
          observer.disconnect();
          clearInterval(checkStability);
          resolve();
        }
      }, 100);
    });
  }, selector);
}

/**
 * 複数セレクタの要素が全て見える状態になるまで待機
 */
export async function waitForAllElementsVisible(
  page: Page,
  selectors: string[],
  timeoutMs: number = 5000
): Promise<void> {
  for (const selector of selectors) {
    await page
      .locator(selector)
      .waitFor({ state: "visible", timeout: timeoutMs });
  }
}

/**
 * ページのスクロール位置を特定の位置に設定
 */
export async function setScrollPosition(
  page: Page,
  position: "top" | "middle" | "bottom" | number
): Promise<void> {
  if (typeof position === "number") {
    await page.evaluate((pos) => window.scrollTo(0, pos), position);
  } else {
    await page.evaluate((pos) => {
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      switch (pos) {
        case "top":
          window.scrollTo(0, 0);
          break;
        case "middle":
          window.scrollTo(0, (scrollHeight - viewportHeight) / 2);
          break;
        case "bottom":
          window.scrollTo(0, scrollHeight - viewportHeight);
          break;
      }
    }, position);
  }

  await page.waitForTimeout(300); // スクロール完了待機
}

/**
 * 特定のビューポートサイズでスクリーンショット
 */
export async function captureAtViewport(
  page: Page,
  path: string,
  viewport: { width: number; height: number; name: string },
  screenshotName: string,
  options: any = {}
): Promise<void> {
  await page.setViewportSize({
    width: viewport.width,
    height: viewport.height,
  });

  await page.goto(path);
  await waitForPageReady(page);
  await preparePageForScreenshot(page);

  await expect(page).toHaveScreenshot(screenshotName, {
    fullPage: true,
    ...DEFAULT_SCREENSHOT_OPTIONS.fullPage,
    ...options,
  });
}

/**
 * ダーク/ライトモードを切り替えてスクリーンショット（CSS メディアクエリ対応）
 */
export async function captureWithColorScheme(
  page: Page,
  path: string,
  screenshotNameLight: string,
  screenshotNameDark: string,
  options: any = {}
): Promise<void> {
  await page.goto(path);
  await waitForPageReady(page);

  // ライトモード
  await page.emulateMedia({ colorScheme: "light" });
  await preparePageForScreenshot(page);
  await expect(page).toHaveScreenshot(screenshotNameLight, {
    fullPage: true,
    ...DEFAULT_SCREENSHOT_OPTIONS.fullPage,
    ...options,
  });

  // ダークモード
  await page.emulateMedia({ colorScheme: "dark" });
  await preparePageForScreenshot(page);
  await expect(page).toHaveScreenshot(screenshotNameDark, {
    fullPage: true,
    ...DEFAULT_SCREENSHOT_OPTIONS.fullPage,
    ...options,
  });
}

/**
 * スクリーンショット + ファイル保存（デバッグ用）
 */
export async function saveScreenshotFile(
  page: Page,
  filename: string,
  options: { fullPage?: boolean } = {}
): Promise<void> {
  const filepath = `playwright/tests/screenshots/${filename}`;
  await page.screenshot({
    path: filepath,
    fullPage: options.fullPage !== false, // デフォルトは fullPage
  });
  console.log(`✅ Screenshot saved: ${filepath}`);
}

/**
 * PDF として保存（レポート生成用）
 */
export async function savePdf(
  page: Page,
  filename: string,
  options: any = {}
): Promise<void> {
  const filepath = `playwright/tests/screenshots/${filename}`;
  await page.pdf({
    path: filepath,
    format: "A4",
    printBackground: true,
    ...options,
  });
  console.log(`✅ PDF saved: ${filepath}`);
}

/**
 * イメージ比較オプションのビルダー（fluent API）
 */
export class ScreenshotOptionsBuilder {
  private options: any = {};

  fullPage(): this {
    this.options.fullPage = true;
    return this;
  }

  viewportOnly(): this {
    this.options.fullPage = false;
    return this;
  }

  withMaxDiffPixels(pixels: number): this {
    this.options.maxDiffPixels = pixels;
    return this;
  }

  withThreshold(threshold: number): this {
    this.options.threshold = threshold;
    return this;
  }

  mask(selectors: string | string[]): this {
    if (typeof selectors === "string") {
      this.options.mask = [selectors];
    } else {
      this.options.mask = selectors;
    }
    return this;
  }

  clip(region: { x: number; y: number; width: number; height: number }): this {
    this.options.clip = region;
    return this;
  }

  build(): any {
    return this.options;
  }
}

/**
 * テストレポート用のメタデータ
 */
export interface ScreenshotMetadata {
  name: string;
  path: string;
  viewport?: { width: number; height: number };
  timestamp: number;
  description?: string;
}

/**
 * スクリーンショットメタデータ収集
 */
export class ScreenshotCollector {
  private screenshots: ScreenshotMetadata[] = [];

  add(metadata: ScreenshotMetadata): void {
    this.screenshots.push(metadata);
  }

  getAll(): ScreenshotMetadata[] {
    return this.screenshots;
  }

  generateReport(): string {
    let report = "# ビジュアルリグレッション テストレポート\n\n";
    report += `生成日時: ${new Date().toLocaleString("ja-JP")}\n\n`;

    for (const screenshot of this.screenshots) {
      report += `## ${screenshot.name}\n`;
      report += `- パス: ${screenshot.path}\n`;
      report += `- ビューポート: ${
        screenshot.viewport
          ? `${screenshot.viewport.width}x${screenshot.viewport.height}`
          : "フルページ"
      }\n`;
      report += `- タイムスタンプ: ${new Date(
        screenshot.timestamp
      ).toLocaleString("ja-JP")}\n`;
      if (screenshot.description) {
        report += `- 説明: ${screenshot.description}\n`;
      }
      report += "\n";
    }

    return report;
  }
}
