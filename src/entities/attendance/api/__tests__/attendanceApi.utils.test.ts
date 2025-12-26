import type { Attendance } from "@shared/api/graphql/types";

import {
  buildAttendanceHistoryInput,
  sanitizeHourlyPaidHolidayTimes,
  sanitizeRests,
} from "../attendanceApi";

describe("attendanceApi utils", () => {
  describe("sanitizeRests", () => {
    it("nullや未定義を除外し、null値はundefinedに変換する", () => {
      const result = sanitizeRests([
        { startTime: "09:00", endTime: "10:00" },
        { startTime: null, endTime: "11:00" },
        null,
        { startTime: "12:00", endTime: null },
      ]);

      expect(result).toEqual([
        { startTime: "09:00", endTime: "10:00" },
        { endTime: "11:00" },
        { startTime: "12:00" },
      ]);
    });

    it("空や未定義の場合は空配列を返す", () => {
      expect(sanitizeRests(undefined)).toEqual([]);
      expect(sanitizeRests(null)).toEqual([]);
      expect(sanitizeRests([])).toEqual([]);
    });
  });

  describe("sanitizeHourlyPaidHolidayTimes", () => {
    it("startとendが揃っているものだけを残す", () => {
      const result = sanitizeHourlyPaidHolidayTimes([
        { startTime: "09:00", endTime: "10:00" },
        { startTime: "11:00", endTime: null },
        { startTime: null, endTime: "12:00" },
        null,
      ]);

      expect(result).toEqual([{ startTime: "09:00", endTime: "10:00" }]);
    });

    it("空や未定義の場合は空配列を返す", () => {
      expect(sanitizeHourlyPaidHolidayTimes(undefined)).toEqual([]);
      expect(sanitizeHourlyPaidHolidayTimes(null)).toEqual([]);
      expect(sanitizeHourlyPaidHolidayTimes([])).toEqual([]);
    });
  });

  describe("buildAttendanceHistoryInput", () => {
    const attendance: Attendance = {
      __typename: "Attendance",
      id: "a1",
      staffId: "s1",
      workDate: "2024-01-01",
      startTime: "09:00",
      endTime: "18:00",
      goDirectlyFlag: false,
      absentFlag: false,
      returnDirectlyFlag: false,
      rests: [{ startTime: "12:00", endTime: "13:00" }, null],
      hourlyPaidHolidayTimes: [
        { startTime: "15:00", endTime: "16:00" },
        { startTime: "17:00", endTime: null },
      ],
      remarks: "memo",
      paidHolidayFlag: false,
      specialHolidayFlag: false,
      hourlyPaidHolidayHours: 0,
      substituteHolidayDate: null,
      isDeemedHoliday: false,
      changeRequests: [],
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    };

    it("AttendanceからHistoryInputを組み立て、createdAt引数を反映する", () => {
      const input = buildAttendanceHistoryInput(
        attendance,
        "2024-02-01T00:00:00.000Z"
      );

      expect(input.staffId).toBe("s1");
      expect(input.workDate).toBe("2024-01-01");
      expect(input.startTime).toBe("09:00");
      expect(input.endTime).toBe("18:00");
      expect(input.remarks).toBe("memo");
      expect(input.createdAt).toBe("2024-02-01T00:00:00.000Z");
    });

    it("restやhourlyPaidHolidayTimesを正しくサニタイズして含める", () => {
      const input = buildAttendanceHistoryInput(
        attendance,
        "2024-02-01T00:00:00.000Z"
      );

      expect(input.rests).toEqual([{ startTime: "12:00", endTime: "13:00" }]);
      expect(input.hourlyPaidHolidayTimes).toEqual([
        { startTime: "15:00", endTime: "16:00" },
      ]);
    });
  });
});
