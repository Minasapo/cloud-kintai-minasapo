import dayjs from "dayjs";

import {
  formatDateSlash,
  formatDateTimeReadable,
  formatRelativeDateTime,
  isoDateFromTimestamp,
} from "../time";

describe("date helpers", () => {
  it("formats dash-separated date to slash-separated", () => {
    expect(formatDateSlash("2024-05-06")).toBe("2024/05/06");
  });

  it("returns empty string for falsy inputs in formatDateSlash and isoDateFromTimestamp", () => {
    expect(formatDateSlash(undefined)).toBe("");
    expect(formatDateSlash(null)).toBe("");
    expect(isoDateFromTimestamp(undefined)).toBe("");
    expect(isoDateFromTimestamp(null)).toBe("");
  });

  it("extracts ISO date portion from timestamp", () => {
    expect(isoDateFromTimestamp("2024-05-06T12:34:56.000Z")).toBe("2024-05-06");
  });

  it("formats readable datetime when valid, otherwise returns original value", () => {
    const iso = "2024-05-06T12:34:56.000Z";
    const expected = dayjs(iso).format("YYYY/MM/DD HH:mm");

    expect(formatDateTimeReadable(iso)).toBe(expected);
    expect(formatDateTimeReadable("not-a-date")).toBe("not-a-date");
    expect(formatDateTimeReadable(undefined)).toBe("");
    expect(formatDateTimeReadable(null)).toBe("");
  });

  it("formats relative datetime for elapsed values", () => {
    const now = dayjs("2026-03-26T12:00:00+09:00");

    expect(formatRelativeDateTime("2026-03-26T12:00:00+09:00", now)).toBe("今");
    expect(formatRelativeDateTime("2026-03-26T11:59:40+09:00", now)).toBe(
      "20秒前",
    );
    expect(formatRelativeDateTime("2026-03-26T11:55:00+09:00", now)).toBe(
      "5分前",
    );
    expect(formatRelativeDateTime("2026-03-26T09:00:00+09:00", now)).toBe(
      "3時間前",
    );
    expect(formatRelativeDateTime("2026-03-25T20:00:00+09:00", now)).toBe(
      "昨日",
    );
    expect(formatRelativeDateTime("2026-03-23T12:00:00+09:00", now)).toBe(
      "3日前",
    );
    expect(formatRelativeDateTime("2026-03-01T12:00:00+09:00", now)).toBe(
      "3/1",
    );
    expect(formatRelativeDateTime("2025-12-31T12:00:00+09:00", now)).toBe(
      "2025/12/31",
    );
    expect(formatRelativeDateTime("not-a-date", now)).toBe("not-a-date");
    expect(formatRelativeDateTime(undefined, now)).toBe("");
    expect(formatRelativeDateTime(null, now)).toBe("");
  });
});
