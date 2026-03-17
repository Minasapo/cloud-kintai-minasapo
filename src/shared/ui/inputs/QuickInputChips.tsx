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
          className="inline-flex min-h-8 items-center gap-1 rounded-full border px-3 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            backgroundColor: entry.enabled ? "#ECF8F1" : "#FFFFFF",
            borderColor: entry.enabled ? "rgba(30, 170, 106, 0.4)" : "#D0D7D4",
            color: entry.enabled ? "#1EAA6A" : "#45574F",
          }}
          onClick={() => {
            const endTime = dayjs(
              `${workDate.format("YYYY-MM-DD")} ${entry.time}`
            ).toISOString();
            onSelectTime(endTime);
          }}
        >
          <span aria-hidden="true" className="inline-flex h-4 w-4 items-center">
            <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
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
