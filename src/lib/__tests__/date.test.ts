import dayjs from "dayjs";

import { formatDateSlash, formatDateTimeReadable, isoDateFromTimestamp } from "../date";

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
});
