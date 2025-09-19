import { expect, Locator, Page } from "@playwright/test";

export class AttendanceLocator {
  private locator: Locator;

  static readonly workStartInputTestId = "desktop-start-time-input";
  static readonly workEndInputTestId = "desktop-end-time-input";
  static readonly restStartInputTestId = "rest-start-time-input-desktop-0";
  static readonly restEndInputTestId = "rest-end-time-input-desktop-0";
  static readonly attendanceSubmitButtonTestId = "attendance-submit-button";

  static readonly clockInButtonTestId = "clock-in-button";
  static readonly restStartButtonTestId = "rest-start-button";
  static readonly restEndButtonTestId = "rest-end-button";
  static readonly clockOutButtonTestId = "clock-out-button";

  static readonly workStatusTextTestId = "work-status-text";

  static readonly startTime: string = "09:00";
  static readonly endTime: string = "18:00";
  static readonly restStartTime: string = "12:00";
  static readonly restEndTime: string = "13:00";

  constructor(private page: Page, private testId: string) {
    this.locator = page.getByTestId(testId);
  }

  async fill(value: string) {
    await this.locator.fill(value);
  }

  async click({ isValid = true } = {}) {
    if (isValid) {
      await this.validateButtons();
    }

    await this.locator.click();

    await this.page.waitForTimeout(500);

    if (isValid) {
      this.checkWorkStatus();
    }
  }

  private async validateButtons() {
    const startEnabled = await this.page
      .getByTestId(AttendanceLocator.clockInButtonTestId)
      .isEnabled();
    const endEnabled = await this.page
      .getByTestId(AttendanceLocator.clockOutButtonTestId)
      .isEnabled();
    const restStartEnabled = await this.page
      .getByTestId(AttendanceLocator.restStartButtonTestId)
      .isEnabled();
    const restEndEnabled = await this.page
      .getByTestId(AttendanceLocator.restEndButtonTestId)
      .isEnabled();

    const actual = {
      start: startEnabled,
      end: endEnabled,
      restStart: restStartEnabled,
      restEnd: restEndEnabled,
    };

    switch (this.testId) {
      case AttendanceLocator.clockInButtonTestId:
        expect(actual).toEqual({
          start: true,
          end: false,
          restStart: false,
          restEnd: false,
        });
        break;

      case AttendanceLocator.restStartButtonTestId:
        expect(actual).toEqual({
          start: false,
          end: true,
          restStart: true,
          restEnd: false,
        });
        break;

      case AttendanceLocator.restEndButtonTestId:
        expect(actual).toEqual({
          start: false,
          end: false,
          restStart: false,
          restEnd: true,
        });
        break;

      case AttendanceLocator.clockOutButtonTestId:
        expect(actual).toEqual({
          start: false,
          end: true,
          restStart: true,
          restEnd: false,
        });
        break;
      default:
        throw new Error(`Unknown testId: ${this.testId}`);
    }
  }

  static checkDefaultWorkStatus(page: Page) {
    expect(page.getByTestId(AttendanceLocator.workStatusTextTestId)).toHaveText(
      "出勤前"
    );
  }

  private checkWorkStatus() {
    const locator = this.page.getByTestId(
      AttendanceLocator.workStatusTextTestId
    );
    switch (this.testId) {
      case AttendanceLocator.clockInButtonTestId:
        expect(locator).toHaveText("勤務中");
        break;
      case AttendanceLocator.restStartButtonTestId:
        expect(locator).toHaveText("休憩中");
        break;
      case AttendanceLocator.restEndButtonTestId:
        expect(locator).not.toHaveText("休憩中");
        break;
      case AttendanceLocator.clockOutButtonTestId:
        expect(locator).toHaveText("勤務終了");
        break;
      default:
        throw new Error(`Unknown testId: ${this.testId}`);
    }
  }
}
