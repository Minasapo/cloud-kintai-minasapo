import {
  ShiftPlanMonthSetting,
  ShiftPlanMonthSettingInput,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

export type ShiftPlanRow = {
  month: number;
  editStart: string;
  editEnd: string;
  enabled: boolean;
  dailyCapacity: string[];
};

export type EditableField = Extract<keyof ShiftPlanRow, "editStart" | "editEnd">;

// デフォルトは「月初〜月末」のフルレンジになるよう事前入力しておく
export const MAX_DAYS_IN_MONTH = 31;
export const DAY_COLUMNS = Array.from(
  { length: MAX_DAYS_IN_MONTH },
  (_, index) => index + 1,
);
export const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
export const SUNDAY_BG = "#ffebee";
export const SATURDAY_BG = "#e3f2fd";
export const HOLIDAY_BG = "#fff8e1";
export const CELL_NOWRAP_SX = { whiteSpace: "nowrap" as const };
export const INPUT_PLACEHOLDER = "入力";
// 自動保存の遅延時間（ミリ秒）
export const AUTO_SAVE_DELAY = 1000;
// 保存時刻の表示フォーマット
export const TIME_FORMAT = "HH:mm:ss";

export const sanitizeCapacityValue = (value: string): string => {
  if (!value.trim()) return "";
  const numericValue = Math.max(0, Number(value));
  if (Number.isNaN(numericValue)) return "";
  return String(Math.trunc(numericValue));
};

export const createDefaultRows = (year: number): ShiftPlanRow[] =>
  Array.from({ length: 12 }, (_, index) => {
    const startOfMonth = dayjs().year(year).month(index).startOf("month");
    const endOfMonth = startOfMonth.endOf("month");
    return {
      month: index + 1,
      editStart: startOfMonth.format("YYYY-MM-DD"),
      editEnd: endOfMonth.format("YYYY-MM-DD"),
      enabled: true,
      dailyCapacity: Array.from({ length: MAX_DAYS_IN_MONTH }, () => ""),
    };
  });

const convertDailyCapacitiesToStrings = (
  capacities?: (number | null)[] | null,
): string[] =>
  Array.from({ length: MAX_DAYS_IN_MONTH }, (_, idx) => {
    const value = capacities?.[idx];
    return typeof value === "number" && !Number.isNaN(value)
      ? String(value)
      : "";
  });

export const buildRowsFromPlans = (
  year: number,
  plans?: (ShiftPlanMonthSetting | null)[] | null,
): ShiftPlanRow[] => {
  const baseRows = createDefaultRows(year);
  if (!plans?.length) return baseRows;
  const planMap = new Map<number, ShiftPlanMonthSetting>();
  plans.forEach((plan) => {
    if (!plan || typeof plan.month !== "number") return;
    planMap.set(plan.month, plan);
  });
  return baseRows.map((row) => {
    const plan = planMap.get(row.month);
    if (!plan) return row;
    return {
      ...row,
      editStart: plan.editStart ?? row.editStart,
      editEnd: plan.editEnd ?? row.editEnd,
      enabled: plan.enabled ?? row.enabled,
      dailyCapacity: convertDailyCapacitiesToStrings(plan.dailyCapacities),
    };
  });
};

export const convertRowsToPlanInput = (
  rows: ShiftPlanRow[],
): ShiftPlanMonthSettingInput[] =>
  rows.map((row) => ({
    month: row.month,
    editStart: row.editStart || null,
    editEnd: row.editEnd || null,
    enabled: row.enabled,
    dailyCapacities: row.dailyCapacity.map((value) =>
      value === "" ? null : Number(value),
    ),
  }));

export const getOrInitYearRows = (
  year: number,
  rowsByYear: Record<number, ShiftPlanRow[]>,
): ShiftPlanRow[] => rowsByYear[year] ?? createDefaultRows(year);

export const areRowsEqual = (left: ShiftPlanRow[], right: ShiftPlanRow[]): boolean => {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i += 1) {
    const a = left[i];
    const b = right[i];
    if (
      a.month !== b.month ||
      a.editStart !== b.editStart ||
      a.editEnd !== b.editEnd ||
      a.enabled !== b.enabled
    ) {
      return false;
    }
    if (a.dailyCapacity.length !== b.dailyCapacity.length) return false;
    for (let j = 0; j < a.dailyCapacity.length; j += 1) {
      if (a.dailyCapacity[j] !== b.dailyCapacity[j]) return false;
    }
  }
  return true;
};
