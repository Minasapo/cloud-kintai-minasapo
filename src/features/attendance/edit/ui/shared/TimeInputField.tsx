import React from "react";

export interface SelectableTime {
  time: string;
  enabled: boolean;
}

export interface TimeInputFieldProps {
  /** 表示値 "HH:mm" or "" */
  value: string;
  inputRef?: React.Ref<HTMLInputElement>;
  disabled?: boolean;
  readOnly?: boolean;
  highlight?: boolean;
  placeholder?: string;
  selectableTimes: SelectableTime[];
  isOptionsOpen: boolean;
  ariaLabel?: string;
  dataTestId?: string;
  onFocus: () => void;
  onBlur: () => void;
  /** テキスト入力変化時 (ドラフト文字列) */
  onChange: (draft: string) => void;
  /** ドロップダウンから時刻を選択した時 */
  onSelectTime: (time: string) => void;
  onDropdownToggle: () => void;
}

export default function TimeInputField({
  value,
  inputRef,
  disabled = false,
  readOnly = false,
  highlight = false,
  placeholder = "--:--",
  selectableTimes,
  isOptionsOpen,
  ariaLabel,
  dataTestId,
  onFocus,
  onBlur,
  onChange,
  onSelectTime,
  onDropdownToggle,
}: TimeInputFieldProps) {
  const enabledTimes = selectableTimes.filter((t) => t.enabled);
  const hasOptions = enabledTimes.length > 0;
  const isDisabledOrReadOnly = !!readOnly || disabled;

  return (
    <div className="relative flex flex-col gap-1">
      {/* ── Input container ── */}
      <div
        className={[
          "relative flex h-[46px] min-w-[170px] items-center rounded-[16px] border bg-white transition",
          isDisabledOrReadOnly
            ? "border-slate-200 bg-slate-100 text-slate-400 shadow-none"
            : [
                "border-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]",
                "focus-within:border-emerald-400 focus-within:shadow-[0_0_0_3px_rgba(15,168,94,0.35)]",
              ].join(" "),
          highlight && !isDisabledOrReadOnly
            ? "animate-pulse border-amber-400 bg-amber-100/70 shadow-[0_0_12px_rgba(255,193,7,0.35)]"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder={placeholder}
          value={value}
          disabled={isDisabledOrReadOnly}
          ref={inputRef}
          data-testid={dataTestId}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => onChange(e.target.value)}
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 pr-11 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:text-slate-400"
        />

        {/* Chevron button – rotates when open */}
        <button
          type="button"
          aria-label={ariaLabel ?? "時刻の候補を表示"}
          disabled={isDisabledOrReadOnly || !hasOptions}
          onMouseDown={(e) => {
            e.preventDefault();
            onDropdownToggle();
          }}
          className={[
            "absolute inset-y-0 right-0 flex w-10 appearance-none items-center justify-center border-0 bg-transparent p-0 shadow-none outline-none transition-all duration-150",
            "focus:outline-none focus:ring-0",
            isDisabledOrReadOnly || !hasOptions
              ? "cursor-not-allowed text-slate-300"
              : "text-slate-400 hover:text-emerald-600",
            isOptionsOpen ? "rotate-180" : "rotate-0",
          ].join(" ")}
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

      {/* ── Dropdown panel ── */}
      {isOptionsOpen && hasOptions && (
        <div className="animate-dropdown-enter absolute left-0 top-[calc(100%+4px)] z-20 min-w-full rounded-[16px] border border-slate-200 bg-white p-1.5 shadow-[0_12px_34px_rgba(17,24,39,0.2)]">
          {enabledTimes.map((entry) => {
            const isActive = entry.time === value;
            return (
              <button
                key={entry.time}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectTime(entry.time);
                }}
                className={[
                  "mb-0.5 flex w-full items-center justify-between gap-2 rounded-[10px] px-3 py-2 text-left text-sm font-medium transition last:mb-0",
                  isActive
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-slate-900 hover:bg-emerald-50 hover:text-emerald-700",
                ].join(" ")}
              >
                <span>{entry.time}</span>
                {isActive && (
                  <svg
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    aria-hidden="true"
                    className="h-3.5 w-3.5 shrink-0"
                  >
                    <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
