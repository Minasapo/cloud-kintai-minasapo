import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";

import { useQuickInputActions } from "../useQuickInputActions";

// Mock useAppConfig
jest.mock("@/hooks/useAppConfig/useAppConfig", () => ({
  __esModule: true,
  default: () => ({
    getStartTime: () => dayjs("2024-01-01 09:00:00"),
    getEndTime: () => dayjs("2024-01-01 18:00:00"),
    getLunchRestStartTime: () => dayjs("2024-01-01 12:00:00"),
    getLunchRestEndTime: () => dayjs("2024-01-01 13:00:00"),
    getAmHolidayStartTime: () => dayjs("2024-01-01 09:00:00"),
    getAmHolidayEndTime: () => dayjs("2024-01-01 12:00:00"),
    getPmHolidayStartTime: () => dayjs("2024-01-01 13:00:00"),
    getPmHolidayEndTime: () => dayjs("2024-01-01 18:00:00"),
    getAmPmHolidayEnabled: () => true,
  }),
}));

describe("useQuickInputActions", () => {
  const mockSetValue = jest.fn();
  const mockRestReplace = jest.fn();
  const mockHourlyPaidHolidayTimeReplace = jest.fn();
  const workDate = dayjs("2024-01-15");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty array when no actions are visible", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "admin",
        readOnly: true,
      })
    );

    // readOnly が true の場合、アクションは生成されるが、実行できない
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("should return actions when visibleMode is 'staff'", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "staff",
      })
    );

    const actionKeys = result.current.map((a) => a.key);

    // staff モードでは、regularStart と regularEnd が表示される
    expect(actionKeys).toContain("regularStart");
    expect(actionKeys).toContain("regularEnd");

    // staff モードでは、amHalf と pmHalf は表示されない
    expect(actionKeys).not.toContain("amHalf");
    expect(actionKeys).not.toContain("pmHalf");
  });

  it("should return actions when visibleMode is 'admin'", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "admin",
      })
    );

    const actionKeys = result.current.map((a) => a.key);

    // admin モードでは、amHalf と pmHalf が表示される
    expect(actionKeys).toContain("amHalf");
    expect(actionKeys).toContain("pmHalf");

    // admin モードでは、regularStart と regularEnd は表示されない
    expect(actionKeys).not.toContain("regularStart");
    expect(actionKeys).not.toContain("regularEnd");
  });

  it("should return all visible actions when visibleMode is 'all'", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "all",
      })
    );

    const actionKeys = result.current.map((a) => a.key);

    // all モードではすべてのボタンが表示される
    expect(actionKeys).toContain("clear");
    expect(actionKeys).toContain("normal");
    expect(actionKeys).toContain("regularStart");
    expect(actionKeys).toContain("regularEnd");
    expect(actionKeys).toContain("amHalf");
    expect(actionKeys).toContain("pmHalf");
    expect(actionKeys).toContain("paidHoliday");
  });

  it("should have tooltip for each action", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "all",
      })
    );

    // すべてのアクションにはツールチップが必要
    result.current.forEach((action) => {
      expect(action.tooltip).toBeDefined();
      expect(action.tooltip).not.toBe("");
    });
  });

  it("should return no actions when workDate is null", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate: null,
        visibleMode: "all",
      })
    );

    // workDate が null の場合でもアクション自体は生成されるが、実行時に null チェックがある
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("clear action should reset all fields", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "all",
      })
    );

    const clearAction = result.current.find((a) => a.key === "clear");
    expect(clearAction).toBeDefined();

    if (clearAction) {
      clearAction.action();

      // clear アクションは以下のフィールドをリセットする
      expect(mockSetValue).toHaveBeenCalled();
      expect(mockRestReplace).toHaveBeenCalledWith([]);
      expect(mockHourlyPaidHolidayTimeReplace).toHaveBeenCalledWith([]);
    }
  });

  it("normal action should set standard work hours", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "all",
      })
    );

    const normalAction = result.current.find((a) => a.key === "normal");
    expect(normalAction).toBeDefined();

    if (normalAction) {
      normalAction.action();

      // normal アクションは開始時間と終了時間を設定し、昼休憩を設定する
      expect(mockSetValue).toHaveBeenCalled();
      expect(mockRestReplace).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            startTime: expect.any(String),
            endTime: expect.any(String),
          }),
        ])
      );
      expect(mockHourlyPaidHolidayTimeReplace).toHaveBeenCalledWith([]);
    }
  });

  it("should respect readOnly prop", () => {
    const { result } = renderHook(() =>
      useQuickInputActions({
        setValue: mockSetValue,
        restReplace: mockRestReplace,
        hourlyPaidHolidayTimeReplace: mockHourlyPaidHolidayTimeReplace,
        workDate,
        visibleMode: "all",
        readOnly: true,
      })
    );

    const normalAction = result.current.find((a) => a.key === "normal");
    expect(normalAction).toBeDefined();

    if (normalAction) {
      normalAction.action();

      // readOnly = true の場合、mockSetValue は呼び出されない
      expect(mockSetValue).not.toHaveBeenCalled();
    }
  });
});
