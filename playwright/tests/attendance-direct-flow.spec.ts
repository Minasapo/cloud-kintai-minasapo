/**
 * 直行/直帰モードのE2Eテスト。
 * - 直行/直帰モードのUI表示とボタン動作を検証する。
 * - Playwrightを使用。
 * @module tests/attendance-direct-flow
 */

import { Page } from "@playwright/test";

import { test } from "./console-log-fixture";
import { AttendanceDirectLocator } from "./locators/AttendanceDirectLocator";

async function handleTimeElapsedErrorDialog(page: Page) {
  try {
    const dialog = page.getByTestId("time-elapsed-error-dialog");
    // 最大3秒だけ待って表示されなければ無視
    await dialog.waitFor({ state: "visible", timeout: 3000 });
    await page.getByTestId("time-elapsed-error-dialog-later-btn").click();
    await dialog.waitFor({ state: "hidden", timeout: 3000 });
  } catch (e) {
    // ダイアログが表示されなかった場合は何もしない
  }
}

test.describe.serial("出勤・休憩・退勤(直行直帰パターン/スタッフ)", () => {
  test.use({ storageState: "playwright/.auth/out-user.json" });

  test("直行直帰モードON", async ({ page }) => {
    await page.goto("/");

    // 過去の勤怠に関するエラーダイアログが出る場合、閉じる
    await handleTimeElapsedErrorDialog(page);

    await new AttendanceDirectLocator(
      page,
      AttendanceDirectLocator.directModeSwitchTestId
    ).directModeSwitch();
  });

  test("直行をクリック", async ({ page }) => {
    await page.goto("/");

    // 過去の勤怠に関するエラーダイアログが出る場合、閉じる
    await handleTimeElapsedErrorDialog(page);

    await new AttendanceDirectLocator(
      page,
      AttendanceDirectLocator.directModeSwitchTestId
    ).directModeSwitch();

    await new AttendanceDirectLocator(
      page,
      AttendanceDirectLocator.goDirectlyButtonTestId
    ).click();
  });

  test("直帰をクリック", async ({ page }) => {
    await page.goto("");

    // 過去の勤怠に関するエラーダイアログが出る場合、閉じる
    await handleTimeElapsedErrorDialog(page);

    await new AttendanceDirectLocator(
      page,
      AttendanceDirectLocator.directModeSwitchTestId
    ).directModeSwitch();

    await new AttendanceDirectLocator(
      page,
      AttendanceDirectLocator.returnDirectlyButtonTestId
    ).click();
  });
});
