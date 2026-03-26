import { AttendanceGetValues, AttendanceSetValue } from "@/features/attendance/edit/model/types";

export function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function getRemarksValue(getValues: AttendanceGetValues): string {
  return (getValues("remarks") as string) || "";
}

export function updateRemarks(
  setValue: AttendanceSetValue | undefined,
  readOnly: boolean,
  value: string,
) {
  if (readOnly || !setValue) return;
  setValue("remarks", value);
}
