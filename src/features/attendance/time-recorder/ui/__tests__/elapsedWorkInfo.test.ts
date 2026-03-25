import dayjs from "dayjs";

import { getUnrecordedDefaultLunchMinutes } from "../elapsedWorkInfo";

describe("getUnrecordedDefaultLunchMinutes", () => {
  it("既定昼休憩帯のうち未記録分だけを控除対象にする", () => {
    const result = getUnrecordedDefaultLunchMinutes({
      now: dayjs("2026-03-12T15:00:00+09:00"),
      attendanceStartTime: "2026-03-12T09:00:00+09:00",
      rests: [
        {
          startTime: "2026-03-12T12:15:00+09:00",
          endTime: "2026-03-12T12:45:00+09:00",
        },
      ],
      lunchRestStartTime: dayjs("2026-03-12T12:00:00+09:00"),
      lunchRestEndTime: dayjs("2026-03-12T13:00:00+09:00"),
    });

    expect(result).toBe(30);
  });

  it("既定昼休憩終了前は控除しない", () => {
    const result = getUnrecordedDefaultLunchMinutes({
      now: dayjs("2026-03-12T12:30:00+09:00"),
      attendanceStartTime: "2026-03-12T09:00:00+09:00",
      rests: [],
      lunchRestStartTime: dayjs("2026-03-12T12:00:00+09:00"),
      lunchRestEndTime: dayjs("2026-03-12T13:00:00+09:00"),
    });

    expect(result).toBe(0);
  });
});
