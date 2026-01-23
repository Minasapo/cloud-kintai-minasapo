import dayjs from "dayjs";

import { AttendanceTime } from "../AttendanceTime";

describe("AttendanceTime", () => {
  it("initializes from HH:mm and date then exposes ISO and display", () => {
    const instance = new AttendanceTime("09:00", "2024-12-25");

    expect(instance.toDisplay()).toBe("09:00");
    expect(instance.toISO()).toContain("2024-12-25T");
    expect(instance.toAPI()).toBe(instance.toISO());
    expect(instance.toString()).toContain("09:00");
  });

  it("creates from ISO string", () => {
    const iso = "2024-12-25T09:00:00.000Z";
    const instance = AttendanceTime.fromISO(iso);
    const expectedDisplay = dayjs(iso).format("HH:mm");

    expect(instance.toISO()).toBe(iso);
    expect(instance.toDisplay()).toBe(expectedDisplay);
  });

  it("throws on invalid HH:mm input", () => {
    expect(() => new AttendanceTime("9:00", "2024-12-25")).toThrow(
      /Invalid time format/
    );
  });

  it("throws on invalid date input", () => {
    expect(() => new AttendanceTime("09:00", "2024/12/25")).toThrow(
      /Invalid date format/
    );
  });

  it("throws when fromISO receives invalid string", () => {
    expect(() => AttendanceTime.fromISO("not-iso")).toThrow(
      /Invalid ISO 8601 format/
    );
  });
});
