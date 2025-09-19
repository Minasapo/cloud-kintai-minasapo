import { expect } from "@playwright/test";
import dayjs from "dayjs";

import { AttendanceLocator } from "./attendance-locator";
import { test } from "./console-log-fixture";

// ==================================================
// スタッフの通常打刻フロー
// ==================================================
test.describe.serial("出勤・休憩・退勤(通常パターン/スタッフ)", () => {
  // スタッフ用のログイン状態を利用
  test.use({ storageState: "playwright/.auth/user.json" });

  const dateStr = dayjs().format("YYYYMMDD");

  test("通常打刻", async ({ page }) => {
    // トップページへ移動
    await page.goto("/");

    // 過去の勤怠に関するエラーダイアログが出る場合、閉じる処理
    try {
      const dialog = page.getByTestId("time-elapsed-error-dialog");
      // 最大3秒だけ待って表示されなければ無視
      await dialog.waitFor({ state: "visible", timeout: 3000 });
      await page.getByTestId("time-elapsed-error-dialog-later-btn").click();
      await dialog.waitFor({ state: "hidden", timeout: 3000 });
    } catch (e) {
      // ダイアログが表示されなかった場合は何もしない
    }

    // 初期ステータスは「出勤前」
    AttendanceLocator.checkDefaultWorkStatus(page);

    // 出勤前 -> 勤務中
    await new AttendanceLocator(
      page,
      AttendanceLocator.clockInButtonTestId
    ).click();

    // 休憩開始 -> 休憩中
    await new AttendanceLocator(
      page,
      AttendanceLocator.restStartButtonTestId
    ).click();

    // 休憩中 -> 勤務中
    await new AttendanceLocator(
      page,
      AttendanceLocator.restEndButtonTestId
    ).click();

    // 勤務中 -> 勤務終了
    await new AttendanceLocator(
      page,
      AttendanceLocator.clockOutButtonTestId
    ).click();
  });

  test("修正申請", async ({ page }) => {
    // 当日分の勤怠編集画面へ移動
    await page.goto(`/attendance/${dateStr}/edit`);

    // ローディングが表示され、処理完了で消えるまで待つ
    const loading = page.getByTestId("attendance-loading");
    await expect(loading).toBeVisible();
    await expect(loading).toBeHidden({ timeout: 10000 });

    await page.waitForTimeout(1000);

    // 勤務時間の入力
    // 出勤
    await new AttendanceLocator(
      page,
      AttendanceLocator.workStartInputTestId
    ).fill(AttendanceLocator.startTime);

    // 退勤
    await new AttendanceLocator(
      page,
      AttendanceLocator.workEndInputTestId
    ).fill(AttendanceLocator.endTime);

    // 休憩時間の入力
    // 休憩開始
    await new AttendanceLocator(
      page,
      AttendanceLocator.restStartInputTestId
    ).fill(AttendanceLocator.restStartTime);

    // 休憩終了
    await new AttendanceLocator(page, "rest-end-time-input-desktop-0").fill(
      AttendanceLocator.restEndTime
    );

    // 編集リクエストを送信
    await new AttendanceLocator(
      page,
      AttendanceLocator.attendanceSubmitButtonTestId
    ).click({ isValid: false });
  });
});

// ==================================================
// 管理者向けの勤怠確認フロー
// ==================================================
test.describe.serial("出勤・休憩・退勤(通常パターン/管理者)", () => {
  // 管理者用のログイン状態を利用
  test.use({ storageState: "playwright/.auth/admin.json" });

  test("勤怠フロー(管理者)", async ({ page }) => {
    // 管理者用勤怠一覧ページへ移動
    await page.goto("/admin/attendances");

    // ダウンロードオプションが見えることを確認
    await expect(page.getByText("ダウンロードオプション")).toBeVisible();

    // テーブル読み込み待ち（簡易ウェイト）
    await page.waitForTimeout(1000);

    // E2Eテスト用ユーザを検索して、最初の行を開く
    const row = page.locator("tr", { hasText: "E2Eテスト 通郎" });
    const rowCount = await row.count();
    expect(rowCount).toBeGreaterThan(0);
    await row.first().getByTestId("attendance-open-button").click();

    // モーダルが表示されることを確認
    await expect(page.getByText("E2Eテスト さんの勤怠")).toBeVisible();

    // 最終行の編集ボタンをクリックして編集画面へ遷移
    await page.waitForSelector('tr[data-testid="last-row"]');
    const attendanceRows = page.locator('tr[data-testid="last-row"]');
    const attendanceRowCount = await attendanceRows.count();
    expect(attendanceRowCount).toBeGreaterThan(0);
    await attendanceRows
      .nth(attendanceRowCount - 1)
      .getByTestId("edit-attendance-button")
      .click();

    // --- 変更リクエストのダイアログが表示されていることを確認し、承認する ---
    // ダイアログ本文の定型文で存在を確認
    const changeRequestMsg = page.getByText(
      "スタッフから勤怠情報の変更リクエストが届いています。"
    );
    // 表示されるまで最大5秒待つ
    await changeRequestMsg.waitFor({ state: "visible", timeout: 5000 });
    await expect(changeRequestMsg).toBeVisible();

    // 承認ボタンをクリック
    await page.getByRole("button", { name: "承認" }).click();

    // 承認処理後は管理者のスタッフ勤怠一覧へ遷移する想定なのでURL変化を待つ
    await page.waitForURL(/\/admin\/staff\/.*\/attendance/, { timeout: 5000 });
  });
});
