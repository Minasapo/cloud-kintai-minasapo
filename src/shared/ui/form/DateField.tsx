import "react-day-picker/dist/style.css";

import dayjs, { type Dayjs } from "dayjs";
import { CalendarDays } from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { ja } from "react-day-picker/locale";

type DateFieldProps = {
  label?: ReactNode;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: ReactNode;
  errorText?: ReactNode;
  className?: string;
  monthOnly?: boolean;
};

const INPUT_BASE_CLASS =
  "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400";

const parseDateDraft = (value: string, format: string) => {
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  if (format === "YYYY/MM") {
    const match = normalized.match(/^(\d{4})\/(\d{1,2})$/);
    if (!match) {
      return null;
    }

    const [, year, month] = match;
    const parsed = dayjs(`${year}-${month}-01`);
    return parsed.isValid() ? parsed.startOf("month") : null;
  }

  if (format === "YYYY/MM/DD") {
    const match = normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) {
      return null;
    }

    const [, year, month, day] = match;
    const parsed = dayjs(`${year}-${month}-${day}`);
    return parsed.isValid() ? parsed : null;
  }

  const parsed = dayjs(normalized);
  return parsed.isValid() ? parsed : null;
};

export default function DateField({
  label,
  value,
  onChange,
  format = "YYYY/MM/DD",
  placeholder,
  disabled,
  required,
  helperText,
  errorText,
  className,
  monthOnly = false,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const hasError = Boolean(errorText);
  const formattedValue = value ? value.format(format) : "";
  const inputValue = draft ?? formattedValue;
  const parsedValue = useMemo(() => {
    return parseDateDraft(inputValue, format);
  }, [format, inputValue]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const message = errorText ?? helperText;
  const resolvedValue = parsedValue ?? value;
  const selectedDate = resolvedValue ? resolvedValue.toDate() : undefined;

  return (
    <div ref={rootRef} className={["flex flex-col gap-1", className].filter(Boolean).join(" ")}>
      {label ? (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required ? <span className="ml-1 text-rose-600">*</span> : null}
        </label>
      ) : null}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          disabled={disabled}
          placeholder={placeholder ?? format}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            const nextValue = event.target.value;
            setDraft(nextValue);
            if (!nextValue) {
              onChange(null);
              return;
            }

            const parsed = parseDateDraft(nextValue, format);
            if (parsed) {
              onChange(monthOnly ? parsed.startOf("month") : parsed);
            }
          }}
          onBlur={() => {
            if (!draft) {
              return;
            }

            const parsed = parseDateDraft(draft, format);
            if (parsed) {
              const nextValue = monthOnly ? parsed.startOf("month") : parsed;
              onChange(nextValue);
            }
            setDraft(null);
          }}
          className={[
            INPUT_BASE_CLASS,
            "pr-11",
            hasError
              ? "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
              : "border-slate-300 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
          ].join(" ")}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label="日付を選択"
          onClick={() => setOpen((current) => !current)}
          className="absolute inset-y-1 right-1 inline-flex w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          <CalendarDays className="h-4 w-4" />
        </button>

        {open ? (
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
            <DayPicker
              animate
              mode="single"
              locale={ja}
              selected={selectedDate}
              month={selectedDate}
              onSelect={(selected) => {
                if (!selected) {
                  onChange(null);
                  setDraft(null);
                  setOpen(false);
                  return;
                }

                const nextValue = monthOnly
                  ? dayjs(selected).startOf("month")
                  : dayjs(selected);
                onChange(nextValue);
                setDraft(null);
                setOpen(false);
              }}
            />
          </div>
        ) : null}
      </div>
      {message ? (
        <p className={`m-0 text-xs leading-5 ${hasError ? "text-rose-600" : "text-slate-500"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
