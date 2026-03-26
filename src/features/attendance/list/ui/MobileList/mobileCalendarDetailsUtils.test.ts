import type { Attendance } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { getAssumedLunchRestRange } from "./mobileCalendarDetailsUtils";

const baseAttendance = {
  startTime: "2026-03-25T09:00:00+09:00",
  endTime: null,
} as Attendance;

describe("getAssumedLunchRestRange", () => {
  it("当日勤務中で休憩打刻なし、昼休憩終了時刻を過ぎていれば仮休憩を返す", () => {
    const result = getAssumedLunchRestRange({
      selectedDate: "2026-03-25",
      selectedAttendance: baseAttendance,
      restCount: 0,
      lunchRestStartTime: dayjs("2026-03-25T12:00:00+09:00"),
      lunchRestEndTime: dayjs("2026-03-25T13:00:00+09:00"),
      now: dayjs("2026-03-25T13:01:00+09:00"),
    });

    expect(result).not.toBeNull();
    expect(dayjs(result?.startTime).format("HH:mm")).toBe("12:00");
    expect(dayjs(result?.endTime).format("HH:mm")).toBe("13:00");
  });

  it("昼休憩終了時刻前なら仮休憩を返さない", () => {
    const result = getAssumedLunchRestRange({
      selectedDate: "2026-03-25",
      selectedAttendance: baseAttendance,
      restCount: 0,
      lunchRestStartTime: dayjs("2026-03-25T12:00:00+09:00"),
      lunchRestEndTime: dayjs("2026-03-25T13:00:00+09:00"),
      now: dayjs("2026-03-25T12:59:00+09:00"),
    });

    expect(result).toBeNull();
  });

  it("明示的な休憩打刻があるなら仮休憩を返さない", () => {
    const result = getAssumedLunchRestRange({
      selectedDate: "2026-03-25",
      selectedAttendance: baseAttendance,
      restCount: 1,
      lunchRestStartTime: dayjs("2026-03-25T12:00:00+09:00"),
      lunchRestEndTime: dayjs("2026-03-25T13:00:00+09:00"),
      now: dayjs("2026-03-25T13:30:00+09:00"),
    });

    expect(result).toBeNull();
  });

  it("当日以外は仮休憩を返さない", () => {
    const result = getAssumedLunchRestRange({
      selectedDate: "2026-03-24",
      selectedAttendance: baseAttendance,
      restCount: 0,
      lunchRestStartTime: dayjs("2026-03-25T12:00:00+09:00"),
      lunchRestEndTime: dayjs("2026-03-25T13:00:00+09:00"),
      now: dayjs("2026-03-25T13:30:00+09:00"),
    });

    expect(result).toBeNull();
  });
});
