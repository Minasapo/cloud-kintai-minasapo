import { expect } from "@playwright/test";
import dayjs from "dayjs";

import { test } from "./console-log-fixture";

const basePath = process.env.VITE_BASE_PATH || "http://localhost:5173";

test.describe.configure({ retries: 0 });

test.use({ storageState: "playwright/.auth/user.json" });

test.describe.serial("出勤・休憩・退勤(通常パターン)", () => {
  test("勤怠フロー", async ({ page }) => {
    await page.goto(`${basePath}/`);
    await expect(page.locator('[data-testid="work-status-text"]')).toHaveText(
      "出勤前"
    );

    await page.click('[data-testid="clock-in-button"]');
    await expect(page.locator('[data-testid="work-status-text"]')).toHaveText(
      "勤務中"
    );

    await page.click('[data-testid="rest-start-button"]');
    await expect(page.locator('[data-testid="work-status-text"]')).toHaveText(
      "休憩中"
    );

    await page.click('[data-testid="rest-end-button"]');
    await expect(
      page.locator('[data-testid="work-status-text"]')
    ).not.toHaveText("休憩中");

    await page.click('[data-testid="clock-out-button"]');
    await expect(page.locator('[data-testid="work-status-text"]')).toHaveText(
      "勤務終了"
    );
  });

  test("勤怠の編集リクエスト", async ({ page }) => {
    const dateStr = dayjs().format("YYYYMMDD");

    await page.goto(`${basePath}/attendance/${dateStr}/edit`);

    await page.waitForTimeout(10000);

    // 勤務時間の入力
    await page.getByTestId("desktop-start-time-input").fill("09:00");

    // 終了時刻の入力
    await page.getByTestId("desktop-end-time-input").fill("18:00");

    // 休憩開始時刻の入力
    await page.getByTestId("rest-start-time-input-desktop-0").fill("12:00");

    // 休憩終了時刻の入力
    await page.getByTestId("rest-end-time-input-desktop-0").fill("13:00");

    // 勤怠の編集リクエストを送信
    await page.getByTestId("attendance-submit-button").click();
  });
});
