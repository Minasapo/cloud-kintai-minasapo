import { expect, test } from "@playwright/test";

test.describe("office/qr ルート", () => {
  test.describe("管理者", () => {
    test.use({ storageState: "playwright/.auth/admin.json" });

    test("/office へアクセスすると QR ビューへ遷移する", async ({ page }) => {
      await page.goto("/office");
      await page.waitForURL(/\/office\/qr$/);
    });

    test("QR ビューは利用可否に応じた state を描画する", async ({ page }) => {
      await page.goto("/office/qr");

      const disabledAlert = page.getByTestId("office-qr-disabled-alert");
      if ((await disabledAlert.count()) > 0) {
        await expect(disabledAlert).toContainText(
          "現在、使用することができません。"
        );
        return;
      }

      await expect(page.getByTestId("office-qr-admin-alert")).toBeVisible();
      await expect(page.getByTestId("office-qr-progress")).toBeVisible();

      await page.getByTestId("office-qr-mode-toggle").click();
      await page.getByTestId("office-qr-refresh-button").click();
      await page.getByTestId("office-qr-copy-button").click();
    });
  });

  test.describe("QR 登録", () => {
    test.use({ storageState: "playwright/.auth/admin.json" });

    test("トークン無しでアクセスするとエラーが表示される", async ({ page }) => {
      await page.goto("/office/qr/register");

      const disabledAlert = page.getByTestId(
        "office-qr-register-disabled-alert"
      );
      if ((await disabledAlert.count()) > 0) {
        await expect(disabledAlert).toContainText(
          "現在、使用することができません。"
        );
        return;
      }

      const errorAlert = page.getByTestId("office-qr-register-error-alert");
      await expect(errorAlert).toContainText("無効なトークン");
    });
  });
});
