import { ShiftRequestStatus } from "@shared/api/graphql/types";

import {
  normalizeStatus,
  shiftRequestStatusToStatus,
  statusToShiftRequestStatus,
} from "../statusMapping";

describe("statusMapping", () => {
  describe("shiftRequestStatusToStatus", () => {
    it("maps ShiftRequestStatus enum to internal status", () => {
      expect(shiftRequestStatusToStatus(ShiftRequestStatus.WORK)).toBe("work");
      expect(shiftRequestStatusToStatus(ShiftRequestStatus.FIXED_OFF)).toBe(
        "fixedOff"
      );
      expect(shiftRequestStatusToStatus(ShiftRequestStatus.REQUESTED_OFF)).toBe(
        "requestedOff"
      );
      expect(shiftRequestStatusToStatus(ShiftRequestStatus.AUTO)).toBe("auto");
    });

    it("defaults to 'auto' for null or undefined", () => {
      expect(shiftRequestStatusToStatus(null)).toBe("auto");
      expect(shiftRequestStatusToStatus(undefined)).toBe("auto");
    });
  });

  describe("statusToShiftRequestStatus", () => {
    it("converts internal status to ShiftRequestStatus enum", () => {
      expect(statusToShiftRequestStatus.work).toBe(ShiftRequestStatus.WORK);
      expect(statusToShiftRequestStatus.fixedOff).toBe(
        ShiftRequestStatus.FIXED_OFF
      );
      expect(statusToShiftRequestStatus.requestedOff).toBe(
        ShiftRequestStatus.REQUESTED_OFF
      );
      expect(statusToShiftRequestStatus.auto).toBe(ShiftRequestStatus.AUTO);
    });
  });

  describe("normalizeStatus", () => {
    it("returns valid status strings as-is", () => {
      expect(normalizeStatus("work")).toBe("work");
      expect(normalizeStatus("fixedOff")).toBe("fixedOff");
      expect(normalizeStatus("requestedOff")).toBe("requestedOff");
      expect(normalizeStatus("auto")).toBe("auto");
    });

    it("maps 'off' to 'fixedOff'", () => {
      expect(normalizeStatus("off")).toBe("fixedOff");
    });

    it("defaults to 'auto' for invalid or undefined values", () => {
      expect(normalizeStatus("invalid")).toBe("auto");
      expect(normalizeStatus(undefined)).toBe("auto");
    });
  });
});
