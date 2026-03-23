import dayjs from "dayjs";
import { useContext, useRef, useState } from "react";
import { Controller, FieldArrayWithId } from "react-hook-form";

import { AppConfigContext } from "@/context/AppConfigContext";
import {
  AttendanceEditContext,
  useAttendanceEditUi,
} from "@/features/attendance/edit/model/AttendanceEditProvider";
import { AttendanceEditInputs } from "@/features/attendance/edit/model/common";

type Props = {
  rest: FieldArrayWithId<AttendanceEditInputs, "rests", "id">;
  index: number;
  testIdPrefix?: string;
};

function toTimeValue(value: string | null | undefined) {
  if (!value) return "";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("HH:mm") : "";
}

function toIsoDateTime(value: string, workDate: dayjs.Dayjs): string | null {
  if (!value) return null;
  const [hour, minute] = value.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return dayjs(workDate)
    .hour(hour)
    .minute(minute)
    .second(0)
    .millisecond(0)
    .toISOString();
}

function normalizeTimeDraft(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isCompleteTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export default function RestStartTimeInput({ rest, index, testIdPrefix = "desktop" }: Props) {
  const { workDate, control, changeRequests, restUpdate } = useContext(AttendanceEditContext);
  const { getLunchRestStartTime } = useContext(AppConfigContext);
  const { readOnly } = useAttendanceEditUi();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputDraft, setInputDraft] = useState("");
  const blurTimeoutRef = useRef<number | null>(null);

  if (!workDate || !control || !restUpdate) return null;

  const disabled = changeRequests.length > 0;
  const lunchTime = getLunchRestStartTime().format("HH:mm");
  const selectableTimes = [{ time: lunchTime, enabled: true }];

  return (
    <div className="flex flex-row gap-1">
      <div className="relative flex flex-col gap-1">
        <Controller
          name={`rests.${index}.startTime`}
          control={control}
          render={({ field }) => (
            <>
              <div
                className={[
                  "relative flex h-[46px] min-w-[170px] items-center rounded-[16px] border border-slate-200 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.72)] transition",
                  "focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100",
                  readOnly || disabled
                    ? "border-slate-200 bg-slate-100 text-slate-400 shadow-none"
                    : "text-slate-800",
                ].join(" ")}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="--:--"
                  value={isEditing ? inputDraft : toTimeValue(field.value as string | null)}
                  disabled={!!readOnly || disabled}
                  ref={field.ref}
                  data-testid={`rest-start-time-input-${testIdPrefix}-${index}`}
                  onFocus={() => {
                    setIsEditing(true);
                    setInputDraft(toTimeValue(field.value as string | null));
                    if (!readOnly && !disabled) {
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
                      const formatted = toIsoDateTime(nextDraft, workDate);
                      field.onChange(formatted);
                      if (formatted) restUpdate(index, { ...rest, startTime: formatted });
                    } else {
                      setInputDraft(toTimeValue(field.value as string | null));
                    }
                    setIsEditing(false);
                    blurTimeoutRef.current = window.setTimeout(() => {
                      setIsOptionsOpen(false);
                      blurTimeoutRef.current = null;
                    }, 120);
                  }}
                  className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  onChange={(e) => {
                    const nextDraft = normalizeTimeDraft(e.target.value);
                    setInputDraft(nextDraft);
                    if (!isCompleteTime(nextDraft)) return;
                    const formatted = toIsoDateTime(nextDraft, workDate);
                    field.onChange(formatted);
                    if (formatted) restUpdate(index, { ...rest, startTime: formatted });
                  }}
                />
                <button
                  type="button"
                  aria-label={`rest-start-time-${index}-options`}
                  disabled={!!readOnly || disabled}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (readOnly || disabled) return;
                    if (blurTimeoutRef.current) {
                      window.clearTimeout(blurTimeoutRef.current);
                      blurTimeoutRef.current = null;
                    }
                    setIsEditing(false);
                    setInputDraft(toTimeValue(field.value as string | null));
                    setIsOptionsOpen((prev) => !prev);
                  }}
                  className="absolute inset-y-0 right-0 flex w-10 appearance-none items-center justify-center border-0 bg-transparent p-0 text-slate-400 shadow-none outline-none transition hover:bg-transparent hover:text-emerald-600 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-slate-300"
                >
                  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
                    <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              {isOptionsOpen && (
                <div className="absolute left-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-[16px] border border-slate-200 bg-white p-1.5 shadow-[0_18px_38px_-30px_rgba(15,23,42,0.28)]">
                  <div className="min-w-[116px] overflow-hidden bg-white">
                    {selectableTimes.map((entry) => {
                      const isActive = entry.time === toTimeValue(field.value as string | null);
                      return (
                        <button
                          key={entry.time}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            const formatted = toIsoDateTime(entry.time, workDate);
                            setInputDraft(entry.time);
                            setIsEditing(false);
                            field.onChange(formatted);
                            if (formatted) restUpdate(index, { ...rest, startTime: formatted });
                            if (blurTimeoutRef.current) {
                              window.clearTimeout(blurTimeoutRef.current);
                              blurTimeoutRef.current = null;
                            }
                            setIsOptionsOpen(false);
                          }}
                          className={[
                            "mb-0.5 block w-full rounded-[10px] px-3 py-2 text-center text-sm font-medium transition last:mb-0",
                            isActive
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-transparent text-slate-900 hover:bg-slate-50",
                          ].join(" ")}
                        >
                          {entry.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
}
