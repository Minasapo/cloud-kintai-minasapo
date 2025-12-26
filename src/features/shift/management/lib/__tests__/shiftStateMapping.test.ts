import { ShiftRequestStatus } from "@shared/api/graphql/types";

import {
  defaultStatusVisual,
  SHIFT_MANUAL_CHANGE_REASON,
  shiftRequestStatusToShiftState,
  shiftStateOptions,
  shiftStateToShiftRequestStatus,
  statusVisualMap,
} from "../shiftStateMapping";

describe("shiftStateMapping", () => {
  describe("shiftRequestStatusToShiftState", () => {
    it("maps ShiftRequestStatus to ShiftState", () => {
      expect(shiftRequestStatusToShiftState(ShiftRequestStatus.WORK)).toBe(
        "work"
      );
      expect(shiftRequestStatusToShiftState(ShiftRequestStatus.FIXED_OFF)).toBe(
        "fixedOff"
      );
      expect(
        shiftRequestStatusToShiftState(ShiftRequestStatus.REQUESTED_OFF)
      ).toBe("requestedOff");
      expect(shiftRequestStatusToShiftState(ShiftRequestStatus.AUTO)).toBe(
        "auto"
      );
    });

    it("defaults to 'auto' for null or undefined", () => {
      expect(shiftRequestStatusToShiftState(null)).toBe("auto");
      expect(shiftRequestStatusToShiftState(undefined)).toBe("auto");
    });
  });

  describe("shiftStateToShiftRequestStatus", () => {
    it("maps ShiftState to ShiftRequestStatus", () => {
      expect(shiftStateToShiftRequestStatus("work")).toBe(
        ShiftRequestStatus.WORK
      );
      expect(shiftStateToShiftRequestStatus("fixedOff")).toBe(
        ShiftRequestStatus.FIXED_OFF
      );
      expect(shiftStateToShiftRequestStatus("requestedOff")).toBe(
        ShiftRequestStatus.REQUESTED_OFF
      );
      expect(shiftStateToShiftRequestStatus("auto")).toBe(
        ShiftRequestStatus.AUTO
      );
    });
  });

  describe("constants and maps", () => {
    it("exports manual change reason constant", () => {
      expect(SHIFT_MANUAL_CHANGE_REASON).toBe("shift-management/manual-edit");
    });

    it("provides visual map for each state", () => {
      expect(statusVisualMap.work).toEqual({
        label: "○",
        color: "success.main",
      });
      expect(statusVisualMap.fixedOff).toEqual({
        label: "固",
        color: "error.main",
      });
      expect(statusVisualMap.requestedOff).toEqual({
        label: "希",
        color: "warning.main",
      });
      expect(statusVisualMap.auto).toEqual({
        label: "△",
        color: "info.main",
      });
    });

    it("provides default visual for fallback", () => {
      expect(defaultStatusVisual).toEqual({
        label: "-",
        color: "text.secondary",
      });
    });

    it("provides state options for UI selection", () => {
      expect(shiftStateOptions).toHaveLength(4);
      expect(shiftStateOptions[0]).toEqual({ value: "work", label: "出勤" });
    });
  });
});
