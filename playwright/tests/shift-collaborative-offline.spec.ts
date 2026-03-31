import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/shift/collaborative");
  await page.waitForLoadState("networkidle");
});

test.describe("リアルタイム同期前提の通信断ハンドリング", () => {
  test("ネットワークが切断された場合、再接続を促す警告が表示される", async ({
    page,
  }) => {
    await page.context().setOfflineMode(true);

    await expect(
      page.getByText("通信が切断されています。再接続後に編集を再開してください。"),
    ).toBeVisible();

    await page.context().setOfflineMode(false);
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("通信が切断されています。再接続後に編集を再開してください。"),
    ).not.toBeVisible();
  });

  test("通信断中もローカルキューは作成しない", async ({ page }) => {
    await page.context().setOfflineMode(true);

    await expect(
      page.getByText("通信が切断されています。再接続後に編集を再開してください。"),
    ).toBeVisible();

    const pendingChanges = await page.evaluate(() =>
      localStorage.getItem("shift_pending_changes"),
    );
    const offlineCache = await page.evaluate(() =>
      localStorage.getItem("shift_offline_cache"),
    );

    expect(pendingChanges).toBeNull();
    expect(offlineCache).toBeNull();
  });

  test("手動同期ボタンは同期中に二重実行されない", async ({ page }) => {
    const syncButton = page.getByLabel("sync");

    await expect(syncButton).toBeVisible();
    await syncButton.click();
    await expect(syncButton).toBeDisabled();
  });

  test("再接続後は警告が消え、同期操作を再開できる", async ({ page }) => {
    await page.context().setOfflineMode(true);

    await expect(
      page.getByText("通信が切断されています。再接続後に編集を再開してください。"),
    ).toBeVisible();

    await page.context().setOfflineMode(false);
    await page.waitForLoadState("networkidle");

    await expect(
      page.getByText("通信が切断されています。再接続後に編集を再開してください。"),
    ).not.toBeVisible();
    await expect(page.getByLabel("sync")).toBeEnabled();
  });
});
