import { act, renderHook } from "@testing-library/react";
import type { Dispatch, SetStateAction } from "react";

import type { ShiftState } from "../../lib/generateMockShifts";
import { useShiftAutoSaveState } from "../useShiftAutoSaveState";

const mockUseAutoSave = jest.fn();

jest.mock("@shared/lib/useAutoSave", () => ({
  useAutoSave: (...args: unknown[]) => mockUseAutoSave(...args),
}));

type ShiftMap = Map<string, Record<string, ShiftState>>;

const createSetMockShifts = (initialState: ShiftMap) => {
  let state = initialState;
  const setMockShiftsSpy = jest.fn();

  const setMockShifts: Dispatch<SetStateAction<ShiftMap>> = (value) => {
    setMockShiftsSpy(value);
    state = typeof value === "function" ? value(state) : value;
  };

  return {
    setMockShifts,
    setMockShiftsSpy,
    getState: () => state,
  };
};

describe("useShiftAutoSaveState", () => {
  const notify = jest.fn();
  const persistShiftRequestChanges = jest.fn();

  beforeEach(() => {
    notify.mockReset();
    persistShiftRequestChanges.mockReset();
    mockUseAutoSave.mockReset();
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      isPending: false,
      lastSavedAt: null,
      lastChangedAt: null,
    });
  });

  it("actual シナリオでは pendingChangesRef に変更を積み、setMockShifts は呼ばない", async () => {
    const pendingChangesRef = {
      current: new Map<string, Map<string, ShiftState>>(),
    };
    const { setMockShifts, setMockShiftsSpy } = createSetMockShifts(new Map());

    const { result } = renderHook(() =>
      useShiftAutoSaveState({
        scenario: "actual",
        isAuthenticated: true,
        pendingChangesRef,
        persistShiftRequestChanges,
        notify,
        setMockShifts,
      }),
    );

    await act(async () => {
      await result.current.applyShiftState(
        ["staff-1"],
        ["2026-07-01", "2026-07-02"],
        "work",
      );
    });

    expect(setMockShiftsSpy).not.toHaveBeenCalled();
    expect(pendingChangesRef.current.get("staff-1")?.get("2026-07-01")).toBe(
      "work",
    );
    expect(pendingChangesRef.current.get("staff-1")?.get("2026-07-02")).toBe(
      "work",
    );
  });

  it("actual 以外のシナリオでは setMockShifts 経由で表示データを更新する", async () => {
    const pendingChangesRef = {
      current: new Map<string, Map<string, ShiftState>>(),
    };

    const initialState: ShiftMap = new Map([
      ["staff-1", { "2026-07-01": "fixedOff" }],
    ]);
    const { setMockShifts, setMockShiftsSpy, getState } =
      createSetMockShifts(initialState);

    const { result } = renderHook(() =>
      useShiftAutoSaveState({
        scenario: "patterned",
        isAuthenticated: true,
        pendingChangesRef,
        persistShiftRequestChanges,
        notify,
        setMockShifts,
      }),
    );

    await act(async () => {
      await result.current.applyShiftState(["staff-1"], ["2026-07-01"], "work");
    });

    expect(setMockShiftsSpy).toHaveBeenCalledTimes(1);
    expect(getState().get("staff-1")?.["2026-07-01"]).toBe("work");
    expect(pendingChangesRef.current.size).toBe(0);
  });

  it("スタッフまたは日付が空なら何もしない", async () => {
    const pendingChangesRef = {
      current: new Map<string, Map<string, ShiftState>>(),
    };
    const { setMockShifts, setMockShiftsSpy } = createSetMockShifts(new Map());

    const { result } = renderHook(() =>
      useShiftAutoSaveState({
        scenario: "actual",
        isAuthenticated: true,
        pendingChangesRef,
        persistShiftRequestChanges,
        notify,
        setMockShifts,
      }),
    );

    await act(async () => {
      await result.current.applyShiftState([], ["2026-07-01"], "work");
      await result.current.applyShiftState(["staff-1"], [], "work");
    });

    expect(setMockShiftsSpy).not.toHaveBeenCalled();
    expect(pendingChangesRef.current.size).toBe(0);
  });
});
