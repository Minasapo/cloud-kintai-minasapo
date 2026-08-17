import { renderHook } from "@testing-library/react";

import { useHolidayCalendarErrorNotification } from "../useHolidayCalendarErrorNotification";

const mockLoggerError = jest.fn();

jest.mock("@shared/lib/logger", () => ({
  createLogger: () => ({
    error: (...args: unknown[]) => mockLoggerError(...args),
  }),
}));

describe("useHolidayCalendarErrorNotification", () => {
  beforeEach(() => {
    mockLoggerError.mockReset();
  });

  it("calendarsError がある時は通知とログ出力を行う", () => {
    const notify = jest.fn();
    const error = new Error("holiday fetch failed");

    renderHook(() =>
      useHolidayCalendarErrorNotification({
        calendarsError: error,
        notify,
      }),
    );

    expect(mockLoggerError).toHaveBeenCalledWith(error);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "エラー",
        tone: "error",
        dedupeKey: "holiday-load-error",
      }),
    );
  });

  it("calendarsError がない時は何もしない", () => {
    const notify = jest.fn();

    renderHook(() =>
      useHolidayCalendarErrorNotification({
        calendarsError: null,
        notify,
      }),
    );

    expect(mockLoggerError).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
  });
});
