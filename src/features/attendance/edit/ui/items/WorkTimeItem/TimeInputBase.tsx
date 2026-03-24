import dayjs from "dayjs";
import { useRef, useState } from "react";
import { Controller } from "react-hook-form";

import { useAttendanceEditUi } from "@/features/attendance/edit/model/AttendanceEditProvider";
import TimeInputField from "@/features/attendance/edit/ui/shared/TimeInputField";

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

function toIsoDateTime(value: string, workDate: dayjs.Dayjs): string | null {
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

function normalizeTimeDraft(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function isCompleteTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export default function TimeInputBase<
  TFieldName extends AttendanceTimeFieldName,
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

  if (!workDate || !control || !setValue) return null;

  return (
    <div className="flex flex-row gap-1">
      <Controller
        key={highlight ? "highlight-on" : "highlight-off"}
        name={name}
        control={control}
        render={({ field }) => (
          <TimeInputField
            value={isEditing ? inputDraft : toTimeValue(field.value)}
            inputRef={field.ref}
            disabled={disabled}
            readOnly={!!readOnly}
            highlight={highlight}
            selectableTimes={quickInputTimes}
            isOptionsOpen={isOptionsOpen}
            ariaLabel={`${name}-time-options`}
            onFocus={() => {
              setIsEditing(true);
              setInputDraft(toTimeValue(field.value));
              if (!readOnly && !disabled && quickInputTimes.some((t) => t.enabled)) {
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
                  formatted as AttendanceFieldValue<AttendanceTimeFieldName>,
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
            onChange={(draft) => {
              const nextDraft = normalizeTimeDraft(draft);
              setInputDraft(nextDraft);
              if (!isCompleteTime(nextDraft)) {
                return;
              }
              const formatted = toIsoDateTime(
                nextDraft,
                workDate,
              ) as AttendanceFieldValue<TFieldName>;
              field.onChange(formatted);
              setValue(
                name as AttendanceTimeFieldName,
                formatted as AttendanceFieldValue<AttendanceTimeFieldName>,
              );
            }}
            onSelectTime={(time) => {
              const formatted = toIsoDateTime(
                time,
                workDate,
              ) as AttendanceFieldValue<TFieldName>;
              setInputDraft(time);
              setIsEditing(false);
              field.onChange(formatted);
              setValue(
                name as AttendanceTimeFieldName,
                formatted as AttendanceFieldValue<AttendanceTimeFieldName>,
                { shouldDirty: true },
              );
              if (blurTimeoutRef.current) {
                window.clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
              setIsOptionsOpen(false);
            }}
            onDropdownToggle={() => {
              if (readOnly || disabled) return;
              if (blurTimeoutRef.current) {
                window.clearTimeout(blurTimeoutRef.current);
                blurTimeoutRef.current = null;
              }
              setIsEditing(false);
              setInputDraft(toTimeValue(field.value));
              setIsOptionsOpen((prev) => !prev);
            }}
          />
        )}
      />
    </div>
  );
}
