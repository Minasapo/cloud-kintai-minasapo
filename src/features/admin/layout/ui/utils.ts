import dayjs from "dayjs";
import type { ChangeEvent } from "react";

export const fieldContainerClassName = "flex flex-col gap-1";
export const fieldLabelClassName = "text-sm font-medium text-slate-700";
export const fieldBaseInputClassName =
  "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-500";

export const getFieldStateClassName = (hasError: boolean) =>
  hasError
    ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
    : "border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

export const createTimeValue = (value: string) => {
  if (!value) {
    return null;
  }

  const [hours, minutes] = value.split(":");
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);

  if (
    Number.isNaN(parsedHours) ||
    Number.isNaN(parsedMinutes) ||
    parsedHours < 0 ||
    parsedHours > 23 ||
    parsedMinutes < 0 ||
    parsedMinutes > 59
  ) {
    return null;
  }

  return dayjs()
    .hour(parsedHours)
    .minute(parsedMinutes)
    .second(0)
    .millisecond(0);
};

export function readChecked(
  event: ChangeEvent<HTMLInputElement>,
  checked?: boolean,
) {
  return checked ?? event.target.checked;
}