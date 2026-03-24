import { Activity, ReactNode } from "react";

type TabItem = {
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

type VacationTabsProps = {
  value: number;
  onChange: (index: number) => void;
  items: TabItem[];
  tabsProps?: {
    "aria-label"?: string;
    variant?: "standard" | "scrollable" | "fullWidth";
    sx?: unknown;
  };
  panelPadding?: number;
};

export function VacationTabs({
  value,
  onChange,
  items,
  tabsProps,
  panelPadding = 2,
}: VacationTabsProps) {
  const isFullWidth = tabsProps?.variant === "fullWidth";

  return (
    <>
      <div
        role="tablist"
        aria-label={tabsProps?.["aria-label"] ?? "vacation-tabs"}
        className={[
          "flex gap-2 overflow-x-auto pb-1",
          isFullWidth ? "w-full" : "w-fit max-w-full",
        ].join(" ")}
      >
        {items.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            role="tab"
            aria-selected={value === idx}
            aria-controls={`vacation-tab-panel-${idx}`}
            disabled={tab.disabled}
            onClick={() => onChange(idx)}
            className={[
              "min-w-fit rounded-full border px-4 py-2 text-sm font-medium transition",
              "disabled:cursor-not-allowed disabled:opacity-40",
              isFullWidth ? "flex-1 whitespace-nowrap" : "whitespace-nowrap",
              value === idx
                ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_24px_-18px_rgba(16,185,129,0.8)]"
                : "border-slate-300 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {items.map((tab, idx) => (
        <Activity
          key={`panel-${idx}`}
          mode={value === idx ? "visible" : "hidden"}
        >
          <div
            id={`vacation-tab-panel-${idx}`}
            role="tabpanel"
            className="pt-3"
            style={{ paddingTop: `${panelPadding * 8}px` }}
          >
            {tab.content}
          </div>
        </Activity>
      ))}
    </>
  );
}
