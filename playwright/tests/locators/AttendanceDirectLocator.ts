import { expect, Locator, Page } from "@playwright/test";

export class AttendanceDirectLocator {
  private locator: Locator;

  static readonly directModeSwitchTestId = "direct-mode-switch";
  static readonly goDirectlyButtonTestId = "go-directly-button";
  static readonly returnDirectlyButtonTestId = "return-directly-button";
  static readonly workStatusTextTestId = "work-status-text";

  constructor(private page: Page, private testId: string) {
    this.locator = page.getByTestId(testId);
  }

  async directModeSwitch() {
    await this.locator.click();
    await this.validateButtons();
  }

  async click() {
    await this.validateButtons();
    await this.locator.click();
    await this.page.waitForTimeout(500);
    this.checkWorkStatus();
  }

  private async validateButtons() {
    switch (this.testId) {
      case AttendanceDirectLocator.directModeSwitchTestId:
        await Promise.all([
          expect(
            this.page.getByTestId(
              AttendanceDirectLocator.goDirectlyButtonTestId
            )
          ).toHaveText("直行"),
          expect(
            this.page.getByTestId(
              AttendanceDirectLocator.returnDirectlyButtonTestId
            )
          ).toHaveText("直帰"),
        ]);

        break;

      case AttendanceDirectLocator.goDirectlyButtonTestId:
        await Promise.all([
          expect(
            this.page.getByTestId(
              AttendanceDirectLocator.goDirectlyButtonTestId
            )
          ).toBeEnabled(),
          expect(
            this.page.getByTestId(
              AttendanceDirectLocator.returnDirectlyButtonTestId
            )
          ).toBeDisabled(),
        ]);

        break;

      case AttendanceDirectLocator.returnDirectlyButtonTestId:
        await Promise.all([
          expect(
            this.page.getByTestId(
              AttendanceDirectLocator.goDirectlyButtonTestId
            )
          ).toBeDisabled(),
          expect(
            this.page.getByTestId(
              AttendanceDirectLocator.returnDirectlyButtonTestId
            )
          ).toBeEnabled(),
        ]);

        break;

      default:
        throw new Error(`Unknown testId: ${this.testId}`);
    }
  }

  static checkDefaultWorkStatus(page: Page) {
    expect(
      page.getByTestId(AttendanceDirectLocator.workStatusTextTestId)
    ).toHaveText("出勤前");
  }

  private checkWorkStatus() {
    const locator = this.page.getByTestId(
      AttendanceDirectLocator.workStatusTextTestId
    );
    switch (this.testId) {
      case AttendanceDirectLocator.goDirectlyButtonTestId:
        expect(locator).toHaveText("勤務中");
        break;

      case AttendanceDirectLocator.returnDirectlyButtonTestId:
        expect(locator).toHaveText("勤務終了");
        break;

      default:
        throw new Error(`Unknown testId: ${this.testId}`);
    }
  }
}
