import dayjs from "dayjs";
import { useRef, useState } from "react";
import { Controller } from "react-hook-form";

import { useAttendanceEditUi } from "@/features/attendance/edit/model/AttendanceEditProvider";

import {
  AttendanceControl,
  AttendanceFieldValue,
  AttendanceSetValue,
  AttendanceTimeFieldName,
} from "../../../model/types";

interface TimeInputBaseProps<TFieldName extends AttendanceTimeFieldName> {
  name: TFieldName;
  control: AttendanceControl;
  setValue: AttendanceSetValue;
  workDate: dayjs.Dayjs;
  quickInputTimes: { time: string; enabled: boolean }[];
  disabled?: boolean;
  highlight?: boolean;
}

function toTimeValue(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return "";
  }

  return parsed.format("HH:mm");
}

function toIsoDateTime(
  value: string,
  workDate: dayjs.Dayjs,
): string | null {
  if (!value) {
    return null;
  }

  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return dayjs(workDate)
    .hour(hour)
    .minute(minute)
    .year(workDate.year())
    .month(workDate.month())
    .date(workDate.date())
    .second(0)
    .millisecond(0)
    .toISOString();
}

export default function TimeInputBase<
  TFieldName extends AttendanceTimeFieldName
>({
  name,
  control,
  setValue,
  workDate,
  quickInputTimes,
  disabled = false,
  highlight = false,
}: TimeInputBaseProps<TFieldName>) {
  const { readOnly } = useAttendanceEditUi();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputDraft, setInputDraft] = useState("");
  const blurTimeoutRef = useRef<number | null>(null);
  const selectableTimes = quickInputTimes.filter((entry) => entry.enabled);

  if (!workDate || !control || !setValue) return null;

  const normalizeTimeDraft = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) {
      return digits;
    }
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  };

  const isCompleteTime = (value: string) =>
    /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);

  return (
    <div className="flex flex-row gap-1">
      <div className="relative flex flex-col gap-1">
        <Controller
          key={highlight ? "highlight-on" : "highlight-off"}
          name={name}
          control={control}
          render={({ field }) => (
            <>
              <div
                className={[
                  "relative flex h-[46px] min-w-[170px] items-center rounded-[10px] border border-slate-300/80 bg-white transition",
                  "focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100",
                  readOnly || disabled
                    ? "bg-slate-100 text-slate-400"
                    : "text-slate-900",
                  highlight
                    ? "animate-pulse border-amber-400 bg-amber-100/70 shadow-[0_0_12px_rgba(255,193,7,0.35)]"
                    : "",
                ].join(" ")}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="--:--"
                  value={isEditing ? inputDraft : toTimeValue(field.value)}
                  disabled={!!readOnly || disabled}
                  ref={field.ref}
                  onFocus={() => {
                    setIsEditing(true);
                    setInputDraft(toTimeValue(field.value));
                    if (!readOnly && !disabled && selectableTimes.length > 0) {
                      if (blurTimeoutRef.current) {
                        window.clearTimeout(blurTimeoutRef.current);
                        blurTimeoutRef.current = null;
                      }
                      setIsOptionsOpen(true);
                    }
                  }}
                  onBlur={() => {
                    field.onBlur();
                    const nextDraft = normalizeTimeDraft(inputDraft);
                    if (isCompleteTime(nextDraft)) {
                      const formatted = toIsoDateTime(
                        nextDraft,
                        workDate,
                      ) as AttendanceFieldValue<TFieldName>;
                      field.onChange(formatted);
                      setValue(
                        name as AttendanceTimeFieldName,
                        formatted as AttendanceFieldValue<AttendanceTimeFieldName>
                      );
                    } else {
                      setInputDraft(toTimeValue(field.value));
                    }
                    setIsEditing(false);
                    blurTimeoutRef.current = window.setTimeout(() => {
                      setIsOptionsOpen(false);
                      blurTimeoutRef.current = null;
                    }, 120);
                  }}
                  className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 pr-11 text-base outline-none"
                  onChange={(event) => {
                    const nextDraft = normalizeTimeDraft(event.target.value);
                    setInputDraft(nextDraft);
                    if (!isCompleteTime(nextDraft)) {
                      return;
                    }
                    const formatted = toIsoDateTime(
                      nextDraft,
                      workDate,
                    ) as AttendanceFieldValue<TFieldName>;
                    const nextValue = formatted as AttendanceFieldValue<TFieldName>;
                    field.onChange(nextValue);
                    setValue(
                      name as AttendanceTimeFieldName,
                      nextValue as AttendanceFieldValue<AttendanceTimeFieldName>
                    );
                  }}
                />
                <button
                  type="button"
                  aria-label={`${name}-time-options`}
                  disabled={!!readOnly || disabled || selectableTimes.length === 0}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    if (readOnly || disabled || selectableTimes.length === 0) {
                      return;
                    }
                    if (blurTimeoutRef.current) {
                      window.clearTimeout(blurTimeoutRef.current);
                      blurTimeoutRef.current = null;
                    }
                    setIsEditing(false);
                    setInputDraft(toTimeValue(field.value));
                    setIsOptionsOpen((prev) => !prev);
                  }}
                  className="absolute inset-y-0 right-0 flex w-10 appearance-none items-center justify-center border-0 bg-transparent p-0 text-slate-400 shadow-none outline-none transition hover:bg-transparent hover:text-slate-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-300"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                    className="h-4 w-4"
                  >
                    <path
                      d="M6 8l4 4 4-4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              {isOptionsOpen && selectableTimes.length > 0 ? (
                <div className="absolute left-0 top-[calc(100%+2px)] z-20 overflow-hidden rounded-md border border-slate-200/70 bg-white p-1.5 shadow-[0_16px_32px_-20px_rgba(15,23,42,0.18),0_6px_14px_-10px_rgba(15,23,42,0.08)]">
                  <div className="min-w-[116px] overflow-hidden bg-white">
                    {selectableTimes.map((entry) => {
                      const isActive = entry.time === toTimeValue(field.value);
                      return (
                        <button
                          key={entry.time}
                          type="button"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            const nextValue = toIsoDateTime(
                              entry.time,
                              workDate,
                            ) as AttendanceFieldValue<TFieldName>;
                            setInputDraft(entry.time);
                            setIsEditing(false);
                            field.onChange(nextValue);
                            setValue(
                              name as AttendanceTimeFieldName,
                              nextValue as AttendanceFieldValue<AttendanceTimeFieldName>,
                              { shouldDirty: true },
                            );
                            if (blurTimeoutRef.current) {
                              window.clearTimeout(blurTimeoutRef.current);
                              blurTimeoutRef.current = null;
                            }
                            setIsOptionsOpen(false);
                          }}
                          className={[
                            "mb-0.5 block w-full rounded-sm px-3 py-2 text-center text-sm font-medium transition last:mb-0",
                            isActive
                              ? "bg-[#1a73e8] text-white"
                              : "bg-transparent text-slate-900 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {entry.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </>
          )}
        />
      </div>
    </div>
  );
}
