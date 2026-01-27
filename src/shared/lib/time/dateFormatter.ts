import dayjs from "dayjs";

export function formatDateSlash(d?: string | null) {
  if (!d) return "";
  return d.replace(/-/g, "/");
}

export function isoDateFromTimestamp(ts?: string | null) {
  if (!ts) return "";
  return ts.split("T")[0];
}

export function formatDateTimeReadable(value?: string | null) {
  if (!value) return "";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return value;
  return parsed.format("YYYY/MM/DD HH:mm");
}
