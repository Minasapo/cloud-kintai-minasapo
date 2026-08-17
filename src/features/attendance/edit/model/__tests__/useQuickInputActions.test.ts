import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";

import { useQuickInputActions } from "../useQuickInputActions";

// Mock useAppConfig
jest.mock("@entities/app-config/model/useAppConfig", () => ({
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

  it("表示可能なアクションがない場合の挙動を返すこと", () => {
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

  it("visibleMode が staff の場合のアクションを返すこと", () => {
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

  it("visibleMode が admin の場合のアクションを返すこと", () => {
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

  it("visibleMode が all の場合に全表示アクションを返すこと", () => {
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

  it("各アクションに tooltip が設定されること", () => {
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

  it("workDate が null の場合のアクション挙動を返すこと", () => {
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

  it("clear アクションで全フィールドをリセットすること", () => {
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

  it("normal アクションで標準勤務時間を設定すること", () => {
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

  it("readOnly プロパティを尊重すること", () => {
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
