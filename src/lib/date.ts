export function formatDateSlash(d?: string | null) {
  if (!d) return "";
  return d.replace(/-/g, "/");
}

export function isoDateFromTimestamp(ts?: string | null) {
  if (!ts) return "";
  return ts.split("T")[0];
}
