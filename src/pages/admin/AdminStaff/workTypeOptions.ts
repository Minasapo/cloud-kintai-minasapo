export const WORK_TYPE_OPTIONS: { label: string; value: string }[] = [
  { label: "平日勤務", value: "weekday" },
  { label: "シフト勤務", value: "shift" },
];

const workTypeMap = new Map<string, string>(
  WORK_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

export function getWorkTypeLabel(value?: string | null) {
  if (!value) return "";
  return workTypeMap.get(value) || "";
}

export default WORK_TYPE_OPTIONS;
