import dayjs, { type Dayjs } from "dayjs";

export interface QuickInputTime {
  time: string;
  enabled: boolean;
}

interface QuickInputChipsProps {
  quickInputTimes: QuickInputTime[];
  workDate: Dayjs;
  disabled?: boolean;
  onSelectTime: (isoString: string) => void;
}

export default function QuickInputChips({
  quickInputTimes,
  workDate,
  disabled = false,
  onSelectTime,
}: QuickInputChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {quickInputTimes.map((entry, index) => (
        <button
          key={index}
          type="button"
          disabled={disabled}
          aria-label={`${entry.time}を入力`}
          className={[
            "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-[0.95rem] font-medium leading-none transition",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
            "hover:-translate-y-[1px] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50",
            entry.enabled
              ? "border-emerald-300 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
              : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
          ].join(" ")}
          onClick={() => {
            const endTime = dayjs(
              `${workDate.format("YYYY-MM-DD")} ${entry.time}`
            ).toISOString();
            onSelectTime(endTime);
          }}
        >
          <span
            aria-hidden="true"
            className={[
              "inline-flex h-5 w-5 items-center justify-center rounded-full border",
              entry.enabled
                ? "border-emerald-400/80 bg-white/80"
                : "border-slate-300 bg-slate-50",
            ].join(" ")}
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
              <path
                d="M8 3.333v9.334M3.333 8h9.334"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span>{entry.time}</span>
        </button>
      ))}
    </div>
  );
}
