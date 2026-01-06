import dayjs from "dayjs";

import { AttendanceDateTime } from "../AttendanceDateTime";

describe("AttendanceDateTime", () => {
  it("sets date from string and exposes multiple formats", () => {
    const dateString = "2024-02-03";
    const instance = new AttendanceDateTime().setDateString(dateString);

    expect(instance.toDataFormat()).toBe("2024-02-03");
    expect(instance.toDisplayDateFormat()).toBe("2024/02/03");
    expect(instance.toDisplayDateTimeFormat()).toBe("2024/02/03 00:00");
    expect(instance.toTimeFormat()).toBe("00:00");
  });

  it("keeps existing date when setDateString receives empty string", () => {
    const base = dayjs("2024-01-10T08:15:00");
    const instance = new AttendanceDateTime().setDate(base);

    instance.setDateString("");

    expect(instance.toDayjs().isSame(base)).toBe(true);
  });

  it("applies preset times for work and rest periods", () => {
    const base = dayjs("2024-03-15T00:00:00");
    const instance = new AttendanceDateTime().setDate(base);

    instance.setWorkStart();
    expect(instance.toTimeFormat()).toBe("09:00");

    instance.setWorkEnd();
    expect(instance.toTimeFormat()).toBe("18:00");

    instance.setRestStart();
    expect(instance.toTimeFormat()).toBe("12:00");

    instance.setRestEnd();
    expect(instance.toTimeFormat()).toBe("13:00");
  });
});
