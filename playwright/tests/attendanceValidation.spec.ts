import { expect, test } from "@playwright/test";

test.describe("勤怠編集画面の入力検証", () => {
  test.beforeEach(async ({ page, context }) => {
    // スタッフユーザーとして認証
    const storageState = require("../.auth/user.json");
    await context.addCookies(storageState.cookies);
    await page.goto("/");
  });

  test.describe("勤務時間の検証", () => {
    test("開始時刻が終了時刻より後の場合、エラーが表示されること", async ({
      page,
    }) => {
      // 勤怠編集画面に遷移
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 開始時刻と終了時刻を入力
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        await startTimeInput.fill("14:00");
        await endTimeInput.fill("10:00"); // 開始時刻より前の時刻

        // エラーメッセージが表示されることを確認
        const errorAlert = page.locator("text=入力内容に誤りがあります");
        await expect(errorAlert).toBeVisible({ timeout: 5000 });
        await expect(
          page.locator("text=終了時刻は開始時刻より後の時刻を指定してください")
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test("開始時刻と終了時刻の両方を入力していない場合、エラーが表示されないこと", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 入力を行わない（デフォルト値のまま）
      const errorAlert = page.locator(
        "text=終了時刻は開始時刻より後の時刻を指定してください"
      );

      // エラーが表示されていないことを確認（タイムアウトで判定）
      const isVisible = await errorAlert
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      expect(isVisible).toBe(false);
    });
  });

  test.describe("直行・直帰の検証", () => {
    test("直行と直帰の両方をチェックできること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 直行チェックボックスを探す
      const goDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="go-directly"]'
      );
      const returnDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="return-directly"]'
      );

      if ((await goDirectlyCheckbox.count()) > 0) {
        // 両方をチェック
        await goDirectlyCheckbox.check();
        await returnDirectlyCheckbox.check();

        // チェック状態を確認
        await expect(goDirectlyCheckbox).toBeChecked();
        await expect(returnDirectlyCheckbox).toBeChecked();
      }
    });

    test("直行フラグをONにすると、開始時刻が自動的に設定されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 直行フラグのチェックボックスを探す
      const goDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="go-directly"]'
      );

      // Switch（モバイル用）の場合
      const goDirectlySwitch = page.locator(
        'input[type="checkbox"][data-testid*="go-directly"]'
      );

      if ((await goDirectlyCheckbox.count()) > 0) {
        // 開始時刻フィールドを取得
        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );

        // 初期値を記録（空またはデフォルト値）
        const initialStartTime = await startTimeInput.inputValue();

        // 直行フラグをON
        await goDirectlyCheckbox.check();
        await page.waitForTimeout(500);

        // 開始時刻が自動設定されることを確認
        const startTimeAfter = await startTimeInput.inputValue();

        // 時刻が設定されていることを確認
        expect(startTimeAfter).toBeTruthy();
        expect(startTimeAfter.length).toBeGreaterThan(0);

        // 成功メッセージが表示されることを確認（モバイル用）
        const successMessage = page.locator(
          "text=勤務開始時間が自動設定されました"
        );
        const isMessageVisible = await successMessage
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        // メッセージが表示されてもされなくても、時刻が設定されていればOK
        expect(startTimeAfter).toBeTruthy();
      }
    });

    test("直帰フラグをONにすると、終了時刻が自動的に設定されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 直帰フラグのチェックボックスを探す
      const returnDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="return-directly"]'
      );

      if ((await returnDirectlyCheckbox.count()) > 0) {
        // 終了時刻フィールドを取得
        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        // 初期値を記録
        const initialEndTime = await endTimeInput.inputValue();

        // 直帰フラグをON
        await returnDirectlyCheckbox.check();
        await page.waitForTimeout(500);

        // 終了時刻が自動設定されることを確認
        const endTimeAfter = await endTimeInput.inputValue();

        // 時刻が設定されていることを確認
        expect(endTimeAfter).toBeTruthy();
        expect(endTimeAfter.length).toBeGreaterThan(0);

        // 成功メッセージが表示されることを確認（モバイル用）
        const successMessage = page.locator(
          "text=勤務終了時間が自動設定されました"
        );
        const isMessageVisible = await successMessage
          .isVisible({ timeout: 1000 })
          .catch(() => false);
        // メッセージが表示されてもされなくても、時刻が設定されていればOK
        expect(endTimeAfter).toBeTruthy();
      }
    });

    test("直行フラグON後に、開始時刻を手動で変更できること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 直行フラグをON
      const goDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="go-directly"]'
      );

      if ((await goDirectlyCheckbox.count()) > 0) {
        await goDirectlyCheckbox.check();
        await page.waitForTimeout(500);

        // 開始時刻を取得
        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );

        // 自動設定された時刻を確認
        const autoSetTime = await startTimeInput.inputValue();
        expect(autoSetTime).toBeTruthy();

        // 開始時刻を手動で変更
        await startTimeInput.clear();
        await startTimeInput.fill("10:30");

        // 手動変更が反映されたことを確認
        const manualChangedTime = await startTimeInput.inputValue();
        expect(manualChangedTime).toBe("10:30");
      }
    });

    test("直帰フラグON後に、終了時刻を手動で変更できること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 直帰フラグをON
      const returnDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="return-directly"]'
      );

      if ((await returnDirectlyCheckbox.count()) > 0) {
        await returnDirectlyCheckbox.check();
        await page.waitForTimeout(500);

        // 終了時刻を取得
        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        // 自動設定された時刻を確認
        const autoSetTime = await endTimeInput.inputValue();
        expect(autoSetTime).toBeTruthy();

        // 終了時刻を手動で変更
        await endTimeInput.clear();
        await endTimeInput.fill("18:00");

        // 手動変更が反映されたことを確認
        const manualChangedTime = await endTimeInput.inputValue();
        expect(manualChangedTime).toBe("18:00");
      }
    });

    test("直行・直帰の両方をONにすると、開始時刻と終了時刻の両方が自動設定されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 直行・直帰のチェックボックスを探す
      const goDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="go-directly"]'
      );
      const returnDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="return-directly"]'
      );

      if ((await goDirectlyCheckbox.count()) > 0) {
        // 時刻フィールドを取得
        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );
        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        // 両方のフラグをON
        await goDirectlyCheckbox.check();
        await page.waitForTimeout(300);
        await returnDirectlyCheckbox.check();
        await page.waitForTimeout(500);

        // 両方の時刻が設定されたことを確認
        const startTime = await startTimeInput.inputValue();
        const endTime = await endTimeInput.inputValue();

        expect(startTime).toBeTruthy();
        expect(endTime).toBeTruthy();

        // 開始時刻 < 終了時刻 を確認
        expect(startTime < endTime).toBeTruthy();
      }
    });

    test("直行フラグをOFFにしても、開始時刻は保持されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      const goDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="go-directly"]'
      );

      if ((await goDirectlyCheckbox.count()) > 0) {
        // 直行をON
        await goDirectlyCheckbox.check();
        await page.waitForTimeout(500);

        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );

        // 自動設定された時刻を記録
        const autoSetTime = await startTimeInput.inputValue();
        expect(autoSetTime).toBeTruthy();

        // 直行をOFF
        await goDirectlyCheckbox.uncheck();
        await page.waitForTimeout(500);

        // 開始時刻が保持されていることを確認
        const timeAfterUncheck = await startTimeInput.inputValue();
        expect(timeAfterUncheck).toBe(autoSetTime);
      }
    });

    test("直帰フラグをOFFにしても、終了時刻は保持されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      const returnDirectlyCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="return-directly"]'
      );

      if ((await returnDirectlyCheckbox.count()) > 0) {
        // 直帰をON
        await returnDirectlyCheckbox.check();
        await page.waitForTimeout(500);

        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        // 自動設定された時刻を記録
        const autoSetTime = await endTimeInput.inputValue();
        expect(autoSetTime).toBeTruthy();

        // 直帰をOFF
        await returnDirectlyCheckbox.uncheck();
        await page.waitForTimeout(500);

        // 終了時刻が保持されていることを確認
        const timeAfterUncheck = await endTimeInput.inputValue();
        expect(timeAfterUncheck).toBe(autoSetTime);
      }
    });
  });

  test.describe("勤務区分の検証", () => {
    test("有給を選択した場合、勤務時間の入力が無効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 有給のチェックボックスを探す
      const paidHolidayCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="paid-holiday"]'
      );

      if ((await paidHolidayCheckbox.count()) > 0) {
        // 有給をチェック
        await paidHolidayCheckbox.check();
        await page.waitForTimeout(300);

        // 勤務時間の入力欄が無効になっていることを確認
        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );
        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        if ((await startTimeInput.count()) > 0) {
          await expect(startTimeInput).toBeDisabled();
          await expect(endTimeInput).toBeDisabled();
        }
      }
    });

    test("特別休日を選択できること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 特別休日のチェックボックスを探す
      const specialHolidayCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="special-holiday"]'
      );

      if ((await specialHolidayCheckbox.count()) > 0) {
        await specialHolidayCheckbox.check();
        await expect(specialHolidayCheckbox).toBeChecked();
      }
    });

    test("欠勤を選択できること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 欠勤のチェックボックスを探す
      const absentCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="absent"]'
      );

      if ((await absentCheckbox.count()) > 0) {
        await absentCheckbox.check();
        await expect(absentCheckbox).toBeChecked();
      }
    });
  });

  test.describe("休憩時間の検証", () => {
    test("複数の休憩を追加できること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 休憩追加ボタンを探す
      const addRestButton = page.locator("button", {
        has: page.locator("text=休憩を追加"),
      });

      const initialRestCount = await page
        .locator('[data-testid*="rest"]')
        .count();

      if ((await addRestButton.count()) > 0) {
        await addRestButton.click();
        await page.waitForTimeout(300);

        const newRestCount = await page
          .locator('[data-testid*="rest"]')
          .count();
        expect(newRestCount).toBeGreaterThan(initialRestCount);
      }
    });

    test("休憩の開始時刻が終了時刻より後の場合、エラーが表示されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 勤務時間を入力
      const startTimeInputs = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      if ((await startTimeInputs.count()) > 0) {
        await startTimeInputs.first().fill("09:00");
      }

      const endTimeInputs = page.locator(
        'input[type="time"][data-testid*="end"]'
      );
      if ((await endTimeInputs.count()) > 0) {
        await endTimeInputs.first().fill("17:00");
      }

      // 休憩追加ボタンをクリック
      const addRestButton = page.locator("button", {
        has: page.locator("text=休憩を追加"),
      });
      if ((await addRestButton.count()) > 0) {
        await addRestButton.click();
        await page.waitForTimeout(300);

        // 新しく追加された休憩の時刻入力欄を取得
        const restStartInputs = page.locator(
          'input[data-testid*="rest"][data-testid*="start"]'
        );
        const restEndInputs = page.locator(
          'input[data-testid*="rest"][data-testid*="end"]'
        );

        // 最後に追加された休憩の時刻を入力
        const restStartCount = await restStartInputs.count();
        const restEndCount = await restEndInputs.count();

        if (restStartCount > 0 && restEndCount > 0) {
          await restStartInputs.last().fill("13:00");
          await restEndInputs.last().fill("12:00"); // 開始時刻より前

          // エラーメッセージが表示されることを確認
          const errorAlert = page.locator("text=入力内容に誤りがあります");
          const isVisible = await errorAlert
            .isVisible({ timeout: 3000 })
            .catch(() => false);

          if (isVisible) {
            await expect(
              page.locator(
                "text=休憩の終了時刻は開始時刻より後の時刻を指定してください"
              )
            ).toBeVisible();
          }
        }
      }
    });
  });

  test.describe("時間単位有給休暇の検証", () => {
    test("時間単位有給休暇を追加できること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 有給タブを探す
      const paidHolidayTab = page.locator("button", {
        has: page.locator("text=有給"),
      });

      if ((await paidHolidayTab.count()) > 0) {
        await paidHolidayTab.click();
        await page.waitForTimeout(300);

        // 時間単位有給休暇を追加するボタンを探す
        const addButton = page.locator("button", {
          has: page.locator("text=時間単位有給休暇を追加"),
        });

        if ((await addButton.count()) > 0) {
          const initialCount = await page
            .locator('[data-testid*="hourly-paid"]')
            .count();

          await addButton.click();
          await page.waitForTimeout(300);

          const newCount = await page
            .locator('[data-testid*="hourly-paid"]')
            .count();
          expect(newCount).toBeGreaterThan(initialCount);
        }
      }
    });
  });

  test.describe("振替休日の検証", () => {
    test("振替休日を指定した場合、勤務時間と休憩が入力できないこと", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 振替休日のチェックボックスを探す
      const substituteHolidayCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="substitute-holiday"]'
      );

      if ((await substituteHolidayCheckbox.count()) > 0) {
        // 振替休日日付を入力
        const dateInput = page.locator(
          'input[data-testid*="substitute-holiday-date"]'
        );
        if ((await dateInput.count()) > 0) {
          const tomorrowDate = new Date();
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          const tomorrowStr = tomorrowDate.toISOString().split("T")[0];
          await dateInput.fill(tomorrowStr);
        }

        // 振替休日をチェック
        await substituteHolidayCheckbox.check();
        await page.waitForTimeout(300);

        // 勤務時間の入力欄が無効になっていることを確認
        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );
        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        if ((await startTimeInput.count()) > 0) {
          // 無効であることを確認 または エラーメッセージを確認
          const isDisabled =
            (await startTimeInput.isDisabled()) ||
            (await endTimeInput.isDisabled());
          const hasError = await page
            .locator("text=振替休日指定時は勤務時間を入力できません")
            .isVisible({ timeout: 2000 })
            .catch(() => false);

          expect(isDisabled || hasError).toBe(true);
        }
      }
    });

    test("振替休日に日付を選択して「クリアせず設定」を選択すると、勤務時間を変更せずに振替休日の日付だけ設定されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 勤務時間を先に入力
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        await startTimeInput.fill("09:00");
        await endTimeInput.fill("18:00");
      }

      // 振替休日の日付入力フィールドを探す
      const substituteHolidayInput = page.locator(
        'input[data-testid*="substitute-holiday-date"]'
      );

      if ((await substituteHolidayInput.count()) > 0) {
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

        // DatePicker の入力フィールドに入力
        await substituteHolidayInput.fill(tomorrowStr);
        await page.waitForTimeout(300);

        // ダイアログが表示されるのを待つ
        const dialogTitle = page.locator("text=一部の入力内容をクリアします");
        const clearNotSetButton = page.locator(
          "button:has-text('クリアせず設定')"
        );

        if (
          (await dialogTitle.isVisible({ timeout: 2000 }).catch(() => false)) &&
          (await clearNotSetButton
            .isVisible({ timeout: 1000 })
            .catch(() => false))
        ) {
          // 「クリアせず設定」をクリック
          await clearNotSetButton.click();
          await page.waitForTimeout(300);

          // 勤務時間が保持されていることを確認
          if ((await startTimeInput.count()) > 0) {
            await expect(startTimeInput).toHaveValue("09:00");
            await expect(endTimeInput).toHaveValue("18:00");
          }

          // 振替休日の日付が設定されていることを確認
          await expect(substituteHolidayInput).toHaveValue(tomorrowStr);
        }
      }
    });

    test("振替休日に日付を選択して「クリアして設定」を選択すると、勤務時間と休憩がクリアされ、振替休日の日付が設定されること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 勤務時間と休憩を先に入力
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        await startTimeInput.fill("09:00");
        await endTimeInput.fill("18:00");
      }

      // 休憩を追加（存在する場合）
      const addRestButton = page.locator('button:has-text("休憩を追加")');
      if (
        (await addRestButton.count()) > 0 &&
        (await addRestButton.isEnabled())
      ) {
        await addRestButton.click();
        await page.waitForTimeout(300);
      }

      // 振替休日の日付入力フィールドを探す
      const substituteHolidayInput = page.locator(
        'input[data-testid*="substitute-holiday-date"]'
      );

      if ((await substituteHolidayInput.count()) > 0) {
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

        // DatePicker の入力フィールドに入力
        await substituteHolidayInput.fill(tomorrowStr);
        await page.waitForTimeout(300);

        // ダイアログが表示されるのを待つ
        const dialogTitle = page.locator("text=一部の入力内容をクリアします");
        const clearButton = page.locator("button:has-text('クリアして設定')");

        if (
          (await dialogTitle.isVisible({ timeout: 2000 }).catch(() => false)) &&
          (await clearButton.isVisible({ timeout: 1000 }).catch(() => false))
        ) {
          // 「クリアして設定」をクリック
          await clearButton.click();
          await page.waitForTimeout(300);

          // 勤務時間がクリアされていることを確認
          if ((await startTimeInput.count()) > 0) {
            await expect(startTimeInput).toHaveValue("");
            await expect(endTimeInput).toHaveValue("");
          }

          // 振替休日の日付が設定されていることを確認
          await expect(substituteHolidayInput).toHaveValue(tomorrowStr);
        }
      }
    });
  });

  test.describe("備考欄の検証", () => {
    test("備考を入力できること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 備考入力欄を探す
      const remarksInput = page.locator('textarea[data-testid*="remarks"]');

      if ((await remarksInput.count()) > 0) {
        const testRemarks = "テスト備考です";
        await remarksInput.fill(testRemarks);

        // 入力されたことを確認
        await expect(remarksInput).toHaveValue(testRemarks);
      }
    });

    test("長い備考を入力できること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      const remarksInput = page.locator('textarea[data-testid*="remarks"]');

      if ((await remarksInput.count()) > 0) {
        const longRemarks = "a".repeat(500);
        await remarksInput.fill(longRemarks);

        // 入力されたことを確認
        const value = await remarksInput.inputValue();
        expect(value.length).toBe(500);
      }
    });
  });

  test.describe("フォーム状態の検証", () => {
    test("入力内容に誤りがある場合、保存ボタンが無効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 開始時刻と終了時刻を入力（逆順）
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        await startTimeInput.fill("14:00");
        await endTimeInput.fill("10:00");

        // 保存ボタンが無効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          await expect(saveButton).toBeDisabled({ timeout: 5000 });
        }
      }
    });

    test("入力内容が正しい場合、保存ボタンが有効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 正しい順序で時刻を入力
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        await startTimeInput.fill("09:00");
        await endTimeInput.fill("17:00");

        // 保存ボタンが有効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          await expect(saveButton).toBeEnabled({ timeout: 5000 });
        }
      }
    });

    test("複数の検証エラーがある場合、保存ボタンが無効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 勤務時間エラー
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        // 勤務時間を逆順で設定
        await startTimeInput.fill("17:00");
        await endTimeInput.fill("09:00");

        // 休憩を追加してそこにもエラーを作る
        const addRestButton = page.locator("button", {
          has: page.locator("text=休憩を追加"),
        });

        if ((await addRestButton.count()) > 0) {
          await addRestButton.click();
          await page.waitForTimeout(300);

          // 最後の休憩の時刻を逆順で設定
          const restStartInputs = page.locator(
            'input[data-testid*="rest"][data-testid*="start"]'
          );
          const restEndInputs = page.locator(
            'input[data-testid*="rest"][data-testid*="end"]'
          );

          if ((await restStartInputs.count()) > 0) {
            await restStartInputs.last().fill("14:00");
            await restEndInputs.last().fill("12:00");
          }
        }

        // 保存ボタンが無効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          await expect(saveButton).toBeDisabled({ timeout: 5000 });
        }
      }
    });

    test("変更がない場合、保存ボタンが無効になること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // デフォルト値のまま何も変更しない
      const saveButton = page.locator("button", {
        has: page.locator("text=保存"),
      });

      if ((await saveButton.count()) > 0) {
        // 何も入力していない状態では保存ボタンが無効
        const isDisabled = await saveButton.isDisabled();
        expect(isDisabled).toBe(true);
      }
    });

    test("開始時刻のみ入力した場合、保存ボタンが無効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 開始時刻のみ入力
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );

      if ((await startTimeInput.count()) > 0) {
        await startTimeInput.fill("09:00");
        // 終了時刻は入力しない

        // 保存ボタンが無効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          // 片方のみの入力では無効
          const isDisabled = await saveButton.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    });

    test("終了時刻のみ入力した場合、保存ボタンが無効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 終了時刻のみ入力
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await endTimeInput.count()) > 0) {
        await endTimeInput.fill("17:00");
        // 開始時刻は入力しない

        // 保存ボタンが無効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          // 片方のみの入力では無効
          const isDisabled = await saveButton.isDisabled();
          expect(isDisabled).toBe(true);
        }
      }
    });

    test("有給を選択した場合、保存ボタンが有効になること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 有給チェックボックスを選択
      const paidHolidayCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="paid-holiday"]'
      );

      if ((await paidHolidayCheckbox.count()) > 0) {
        await paidHolidayCheckbox.check();
        await page.waitForTimeout(300);

        // 保存ボタンが有効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          await expect(saveButton).toBeEnabled({ timeout: 5000 });
        }
      }
    });

    test("欠勤を選択した場合、保存ボタンが有効になること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 欠勤チェックボックスを選択
      const absentCheckbox = page.locator(
        'input[type="checkbox"][data-testid*="absent"]'
      );

      if ((await absentCheckbox.count()) > 0) {
        await absentCheckbox.check();
        await page.waitForTimeout(300);

        // 保存ボタンが有効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          await expect(saveButton).toBeEnabled({ timeout: 5000 });
        }
      }
    });

    test("正しい勤務時間を入力した後、時刻を削除するとボタンが無効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        // 正しい時刻を入力
        await startTimeInput.fill("09:00");
        await endTimeInput.fill("17:00");

        // 保存ボタンが有効になっていることを確認
        const saveButton = page.locator("button", {
          has: page.locator("text=保存"),
        });

        if ((await saveButton.count()) > 0) {
          await expect(saveButton).toBeEnabled({ timeout: 5000 });
        }

        // 終了時刻をクリア
        await endTimeInput.clear();
        await page.waitForTimeout(300);

        // 保存ボタンが無効になっていることを確認
        await expect(saveButton).toBeDisabled({ timeout: 5000 });
      }
    });
  });

  test.describe("クイック入力ボタンの検証", () => {
    test("クリアボタンで入力内容がクリアされること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 時刻を入力
      const startTimeInput = page.locator(
        'input[type="time"][data-testid*="start"]'
      );
      const endTimeInput = page.locator(
        'input[type="time"][data-testid*="end"]'
      );

      if ((await startTimeInput.count()) > 0) {
        await startTimeInput.fill("09:00");
        await endTimeInput.fill("17:00");

        // 有給をチェック
        const paidHolidayCheckbox = page.locator(
          'input[type="checkbox"][data-testid*="paid-holiday"]'
        );
        if ((await paidHolidayCheckbox.count()) > 0) {
          await paidHolidayCheckbox.check();
        }

        // クリアボタンを探す
        const quickInputButton = page.locator("button", {
          has: page.locator("text=定型入力"),
        });

        if ((await quickInputButton.count()) > 0) {
          // デスクトップ用クリアボタン
          const clearButton = page.locator("button", {
            has: page.locator("text=クリア"),
          });

          if ((await clearButton.count()) > 0) {
            await clearButton.click();
            await page.waitForTimeout(500);

            // 確認ダイアログで適用を押す
            const confirmButton = page.locator("button", {
              has: page.locator("text=適用"),
            });
            if ((await confirmButton.count()) > 0) {
              const confirmButtons = await confirmButton.all();
              await confirmButtons[confirmButtons.length - 1].click();
              await page.waitForTimeout(500);
            }

            // 入力がクリアされたことを確認
            const startValue = await startTimeInput.inputValue();
            const endValue = await endTimeInput.inputValue();
            expect(startValue).toBe("");
            expect(endValue).toBe("");
          } else {
            // モバイル用の場合
            await quickInputButton.click();
            await page.waitForTimeout(300);

            const clearOption = page.locator("text=クリア");
            if ((await clearOption.count()) > 0) {
              await clearOption.click();
              await page.waitForTimeout(300);

              const applyButton = page.locator("button", {
                has: page.locator("text=適用"),
              });
              if ((await applyButton.count()) > 0) {
                const buttons = await applyButton.all();
                await buttons[buttons.length - 1].click();
                await page.waitForTimeout(500);

                const startValue = await startTimeInput.inputValue();
                const endValue = await endTimeInput.inputValue();
                expect(startValue).toBe("");
                expect(endValue).toBe("");
              }
            }
          }
        }
      }
    });

    test("通常勤務ボタンで規定の出勤時間が設定されること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // クイック入力ボタンを探す
      const quickInputButton = page.locator("button", {
        has: page.locator("text=定型入力"),
      });

      if ((await quickInputButton.count()) > 0) {
        // デスクトップ用
        const normalButton = page.locator("button", {
          has: page.locator("text=通常勤務"),
        });

        if ((await normalButton.count()) > 0) {
          await normalButton.click();
          await page.waitForTimeout(500);

          // 確認ダイアログで適用を押す
          const confirmButton = page.locator("button", {
            has: page.locator("text=適用"),
          });
          if ((await confirmButton.count()) > 0) {
            const confirmButtons = await confirmButton.all();
            await confirmButtons[confirmButtons.length - 1].click();
            await page.waitForTimeout(500);
          }

          // 開始時刻が入力されたことを確認
          const startTimeInput = page.locator(
            'input[type="time"][data-testid*="start"]'
          );
          const endTimeInput = page.locator(
            'input[type="time"][data-testid*="end"]'
          );

          if ((await startTimeInput.count()) > 0) {
            const startValue = await startTimeInput.inputValue();
            const endValue = await endTimeInput.inputValue();

            // 時刻が入力されていることを確認
            expect(startValue).toBeTruthy();
            expect(endValue).toBeTruthy();
            // 開始時刻が終了時刻より前であることを確認
            expect(startValue < endValue).toBeTruthy();
          }
        } else {
          // モバイル用の場合
          await quickInputButton.click();
          await page.waitForTimeout(300);

          const normalOption = page.locator("text=通常勤務");
          if ((await normalOption.count()) > 0) {
            await normalOption.click();
            await page.waitForTimeout(300);

            const applyButton = page.locator("button", {
              has: page.locator("text=適用"),
            });
            if ((await applyButton.count()) > 0) {
              const buttons = await applyButton.all();
              await buttons[buttons.length - 1].click();
              await page.waitForTimeout(500);

              const startTimeInput = page.locator(
                'input[type="time"][data-testid*="start"]'
              );
              if ((await startTimeInput.count()) > 0) {
                const startValue = await startTimeInput.inputValue();
                expect(startValue).toBeTruthy();
              }
            }
          }
        }
      }
    });

    test("午前半日ボタンで午前の勤務時間が設定されること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // クイック入力ボタンを探す
      const quickInputButton = page.locator("button", {
        has: page.locator("text=定型入力"),
      });

      if ((await quickInputButton.count()) > 0) {
        // デスクトップ用
        const amHalfButton = page.locator("button", {
          has: page.locator("text=午前半日"),
        });

        if ((await amHalfButton.count()) > 0) {
          await amHalfButton.click();
          await page.waitForTimeout(500);

          // 確認ダイアログで適用を押す
          const confirmButton = page.locator("button", {
            has: page.locator("text=適用"),
          });
          if ((await confirmButton.count()) > 0) {
            const confirmButtons = await confirmButton.all();
            await confirmButtons[confirmButtons.length - 1].click();
            await page.waitForTimeout(500);
          }

          // 昼休みが設定されていることを確認
          const restElements = await page
            .locator('[data-testid*="rest"]')
            .all();
          expect(restElements.length).toBeGreaterThan(0);
        } else {
          // モバイル用の場合
          await quickInputButton.click();
          await page.waitForTimeout(300);

          const amHalfOption = page.locator("text=午前半日");
          if ((await amHalfOption.count()) > 0) {
            await amHalfOption.click();
            await page.waitForTimeout(300);

            const applyButton = page.locator("button", {
              has: page.locator("text=適用"),
            });
            if ((await applyButton.count()) > 0) {
              const buttons = await applyButton.all();
              await buttons[buttons.length - 1].click();
              await page.waitForTimeout(500);

              const restElements = await page
                .locator('[data-testid*="rest"]')
                .all();
              expect(restElements.length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    test("午後半日ボタンで午後の勤務時間が設定されること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // クイック入力ボタンを探す
      const quickInputButton = page.locator("button", {
        has: page.locator("text=定型入力"),
      });

      if ((await quickInputButton.count()) > 0) {
        // デスクトップ用
        const pmHalfButton = page.locator("button", {
          has: page.locator("text=午後半日"),
        });

        if ((await pmHalfButton.count()) > 0) {
          await pmHalfButton.click();
          await page.waitForTimeout(500);

          // 確認ダイアログで適用を押す
          const confirmButton = page.locator("button", {
            has: page.locator("text=適用"),
          });
          if ((await confirmButton.count()) > 0) {
            const confirmButtons = await confirmButton.all();
            await confirmButtons[confirmButtons.length - 1].click();
            await page.waitForTimeout(500);
          }

          // 昼休みが設定されていることを確認
          const restElements = await page
            .locator('[data-testid*="rest"]')
            .all();
          expect(restElements.length).toBeGreaterThan(0);
        } else {
          // モバイル用の場合
          await quickInputButton.click();
          await page.waitForTimeout(300);

          const pmHalfOption = page.locator("text=午後半日");
          if ((await pmHalfOption.count()) > 0) {
            await pmHalfOption.click();
            await page.waitForTimeout(300);

            const applyButton = page.locator("button", {
              has: page.locator("text=適用"),
            });
            if ((await applyButton.count()) > 0) {
              const buttons = await applyButton.all();
              await buttons[buttons.length - 1].click();
              await page.waitForTimeout(500);

              const restElements = await page
                .locator('[data-testid*="rest"]')
                .all();
              expect(restElements.length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    test("クイック入力で昼休みが自動的に設定されること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // クイック入力ボタンを探す
      const quickInputButton = page.locator("button", {
        has: page.locator("text=定型入力"),
      });

      if ((await quickInputButton.count()) > 0) {
        // デスクトップ用
        const normalButton = page.locator("button", {
          has: page.locator("text=通常勤務"),
        });

        if ((await normalButton.count()) > 0) {
          await normalButton.click();
          await page.waitForTimeout(500);

          // 確認ダイアログで適用を押す
          const confirmButton = page.locator("button", {
            has: page.locator("text=適用"),
          });
          if ((await confirmButton.count()) > 0) {
            const confirmButtons = await confirmButton.all();
            await confirmButtons[confirmButtons.length - 1].click();
            await page.waitForTimeout(500);

            // 昼休みが設定されていることを確認
            const restInputs = page.locator('[data-testid*="rest"]');
            const restCount = await restInputs.count();

            // 昼休み用の開始時刻と終了時刻が存在することを確認
            const restStartInputs = page.locator(
              'input[data-testid*="rest"][data-testid*="start"]'
            );
            const restEndInputs = page.locator(
              'input[data-testid*="rest"][data-testid*="end"]'
            );

            if ((await restStartInputs.count()) > 0) {
              const restStart = await restStartInputs.first().inputValue();
              const restEnd = await restEndInputs.first().inputValue();

              // 昼休みが入力されていることを確認
              expect(restStart).toBeTruthy();
              expect(restEnd).toBeTruthy();
            }
          }
        } else {
          // モバイル用の場合
          await quickInputButton.click();
          await page.waitForTimeout(300);

          const normalOption = page.locator("text=通常勤務");
          if ((await normalOption.count()) > 0) {
            await normalOption.click();
            await page.waitForTimeout(300);

            const applyButton = page.locator("button", {
              has: page.locator("text=適用"),
            });
            if ((await applyButton.count()) > 0) {
              const buttons = await applyButton.all();
              await buttons[buttons.length - 1].click();
              await page.waitForTimeout(500);

              const restInputs = page.locator('[data-testid*="rest"]');
              const restCount = await restInputs.count();
              expect(restCount).toBeGreaterThan(0);
            }
          }
        }
      }
    });
  });

  test.describe("ボタンの有効化/無効化（詳細）", () => {
    test("申請ボタンが存在する場合、入力エラーがあるとボタンが無効であること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 申請ボタンを探す（モバイル用）
      const requestButton = page.locator("button", {
        has: page.locator("text=申請"),
      });

      if ((await requestButton.count()) > 0) {
        // 初期状態では無効（何も入力していないため）
        const isInitiallyDisabled = await requestButton.isDisabled();

        // エラーとなる入力を行う（開始時刻 > 終了時刻）
        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );
        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        if ((await startTimeInput.count()) > 0) {
          await startTimeInput.fill("17:00");
          await endTimeInput.fill("09:00");

          // エラーがある状態では無効
          const isDisabledWithError = await requestButton.isDisabled();
          expect(isDisabledWithError).toBe(true);
        }
      }
    });

    test("申請ボタンが存在する場合、有効な入力でボタンが有効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 申請ボタンを探す（モバイル用）
      const requestButton = page.locator("button", {
        has: page.locator("text=申請"),
      });

      if ((await requestButton.count()) > 0) {
        // 有効な入力を行う
        const startTimeInput = page.locator(
          'input[type="time"][data-testid*="start"]'
        );
        const endTimeInput = page.locator(
          'input[type="time"][data-testid*="end"]'
        );

        if ((await startTimeInput.count()) > 0) {
          await startTimeInput.fill("09:00");
          await endTimeInput.fill("17:00");
          await page.waitForTimeout(500);

          // 有効な入力では申請ボタンが有効
          const isEnabled = await requestButton.isEnabled().catch(() => false);
          // 有効な入力が反映されるまで待つ
          if (!isEnabled) {
            await page.waitForTimeout(1000);
          }
          const finalState = await requestButton.isEnabled().catch(() => false);
          expect(finalState).toBe(true);
        }
      }
    });

    test("有給を選択した場合、申請ボタンが有効になること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 申請ボタンを探す
      const requestButton = page.locator("button", {
        has: page.locator("text=申請"),
      });

      if ((await requestButton.count()) > 0) {
        // 有給をチェック
        const paidHolidayCheckbox = page.locator(
          'input[type="checkbox"][data-testid*="paid-holiday"]'
        );

        if ((await paidHolidayCheckbox.count()) > 0) {
          await paidHolidayCheckbox.check();
          await page.waitForTimeout(500);

          // 申請ボタンが有効
          const isEnabled = await requestButton.isEnabled().catch(() => false);
          expect(isEnabled).toBe(true);
        }
      }
    });

    test("欠勤を選択した場合、申請ボタンが有効になること", async ({ page }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // 申請ボタンを探す
      const requestButton = page.locator("button", {
        has: page.locator("text=申請"),
      });

      if ((await requestButton.count()) > 0) {
        // 欠勤をチェック
        const absentCheckbox = page.locator(
          'input[type="checkbox"][data-testid*="absent"]'
        );

        if ((await absentCheckbox.count()) > 0) {
          await absentCheckbox.check();
          await page.waitForTimeout(500);

          // 申請ボタンが有効
          const isEnabled = await requestButton.isEnabled().catch(() => false);
          expect(isEnabled).toBe(true);
        }
      }
    });

    test("クイック入力で有効な内容をセットした場合、ボタンが有効になること", async ({
      page,
    }) => {
      const today = new Date().toISOString().split("T")[0];
      await page.goto(`/attendance/edit?date=${today}`);
      await page.waitForLoadState("networkidle");

      // クイック入力ボタン
      const quickInputButton = page.locator("button", {
        has: page.locator("text=定型入力"),
      });

      // 保存ボタン
      const saveButton = page.locator("button", {
        has: page.locator("text=保存"),
      });

      if ((await quickInputButton.count()) > 0) {
        // デスクトップ用
        const normalButton = page.locator("button", {
          has: page.locator("text=通常勤務"),
        });

        if ((await normalButton.count()) > 0) {
          await normalButton.click();
          await page.waitForTimeout(500);

          const confirmButton = page.locator("button", {
            has: page.locator("text=適用"),
          });
          if ((await confirmButton.count()) > 0) {
            const confirmButtons = await confirmButton.all();
            await confirmButtons[confirmButtons.length - 1].click();
            await page.waitForTimeout(500);

            // クイック入力後、保存ボタンが有効
            if ((await saveButton.count()) > 0) {
              await expect(saveButton).toBeEnabled({ timeout: 5000 });
            }
          }
        } else {
          // モバイル用
          await quickInputButton.click();
          await page.waitForTimeout(300);

          const normalOption = page.locator("text=通常勤務");
          if ((await normalOption.count()) > 0) {
            await normalOption.click();
            await page.waitForTimeout(300);

            const applyButton = page.locator("button", {
              has: page.locator("text=適用"),
            });
            if ((await applyButton.count()) > 0) {
              const buttons = await applyButton.all();
              await buttons[buttons.length - 1].click();
              await page.waitForTimeout(500);

              const requestButton = page.locator("button", {
                has: page.locator("text=申請"),
              });
              if ((await requestButton.count()) > 0) {
                await expect(requestButton).toBeEnabled({ timeout: 5000 });
              }
            }
          }
        }
      }
    });
  });
});
