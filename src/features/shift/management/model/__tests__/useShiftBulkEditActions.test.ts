import { act, renderHook } from "@testing-library/react";

import { useShiftBulkEditActions } from "../useShiftBulkEditActions";

describe("useShiftBulkEditActions", () => {
  it("一括選択がない場合はダイアログを開かない", () => {
    const openBulkEditDialog = jest.fn();
    const applyBulkEdit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useShiftBulkEditActions({
        hasBulkSelection: false,
        openBulkEditDialog,
        applyBulkEdit,
        selectedStaffIds: new Set(["staff-1"]),
        selectedDayKeys: new Set(["2026-07-01"]),
      }),
    );

    act(() => {
      result.current.handleOpenBulkEditDialog();
    });

    expect(openBulkEditDialog).not.toHaveBeenCalled();
  });

  it("一括選択がある場合はダイアログを開く", () => {
    const openBulkEditDialog = jest.fn();
    const applyBulkEdit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useShiftBulkEditActions({
        hasBulkSelection: true,
        openBulkEditDialog,
        applyBulkEdit,
        selectedStaffIds: new Set(["staff-1"]),
        selectedDayKeys: new Set(["2026-07-01"]),
      }),
    );

    act(() => {
      result.current.handleOpenBulkEditDialog();
    });

    expect(openBulkEditDialog).toHaveBeenCalledTimes(1);
  });

  it("apply 時に Set を配列化して applyBulkEdit を呼ぶ", () => {
    const openBulkEditDialog = jest.fn();
    const applyBulkEdit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useShiftBulkEditActions({
        hasBulkSelection: true,
        openBulkEditDialog,
        applyBulkEdit,
        selectedStaffIds: new Set(["staff-1", "staff-2"]),
        selectedDayKeys: new Set(["2026-07-01", "2026-07-02"]),
      }),
    );

    act(() => {
      result.current.handleApplyBulkEdit();
    });

    expect(applyBulkEdit).toHaveBeenCalledTimes(1);
    expect(applyBulkEdit).toHaveBeenCalledWith(
      ["staff-1", "staff-2"],
      ["2026-07-01", "2026-07-02"],
    );
  });

  it("一括選択がない場合は applyBulkEdit を呼ばない", () => {
    const openBulkEditDialog = jest.fn();
    const applyBulkEdit = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useShiftBulkEditActions({
        hasBulkSelection: false,
        openBulkEditDialog,
        applyBulkEdit,
        selectedStaffIds: new Set(["staff-1"]),
        selectedDayKeys: new Set(["2026-07-01"]),
      }),
    );

    act(() => {
      result.current.handleApplyBulkEdit();
    });

    expect(applyBulkEdit).not.toHaveBeenCalled();
  });
});
