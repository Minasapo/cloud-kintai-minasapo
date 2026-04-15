import { type KeyboardEvent, type ReactNode, useId, useRef } from "react";

export type AppTabValue = string | number;

export type AppTabItem<T extends AppTabValue> = {
  value: T;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type AppTabsProps<T extends AppTabValue> = {
  value: T;
  onChange: (value: T) => void;
  items: AppTabItem<T>[];
  appearance?: "pill" | "mui-standard";
  tabsProps?: {
    "aria-label"?: string;
    variant?: "standard" | "scrollable" | "fullWidth";
    sx?: unknown;
  };
  panelPadding?: number;
};

export function AppTabs<T extends AppTabValue>({
  value,
  onChange,
  items,
  appearance = "pill",
  tabsProps,
  panelPadding = 2,
}: AppTabsProps<T>) {
  const isFullWidth = tabsProps?.variant === "fullWidth";
  const idBase = useId().replace(/:/g, "");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = items.findIndex((item) => item.value === value);

  const findNextEnabledIndex = (currentIndex: number, direction: 1 | -1) => {
    if (items.length === 0) {
      return currentIndex;
    }

    for (let offset = 1; offset <= items.length; offset += 1) {
      const nextIndex =
        (currentIndex + direction * offset + items.length) % items.length;

      if (!items[nextIndex]?.disabled) {
        return nextIndex;
      }
    }

    return currentIndex;
  };

  const findEdgeEnabledIndex = (direction: 1 | -1) => {
    const indices =
      direction === 1
        ? items.map((_, index) => index)
        : items.map((_, index) => items.length - index - 1);

    return indices.find((index) => !items[index]?.disabled) ?? activeIndex;
  };

  const focusTab = (index: number) => {
    tabRefs.current[index]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        nextIndex = findNextEnabledIndex(currentIndex, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        nextIndex = findNextEnabledIndex(currentIndex, -1);
        break;
      case "Home":
        nextIndex = findEdgeEnabledIndex(1);
        break;
      case "End":
        nextIndex = findEdgeEnabledIndex(-1);
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextValue = items[nextIndex]?.value;
    if (nextValue !== undefined && nextIndex !== currentIndex) {
      onChange(nextValue);
    }

    focusTab(nextIndex);
  };

  const tabListClassName =
    appearance === "mui-standard"
      ? [
          "flex overflow-x-auto overflow-y-hidden border-b border-slate-200 bg-white",
          isFullWidth ? "w-full" : "w-fit max-w-full",
        ].join(" ")
      : [
          "flex gap-2 overflow-x-auto overflow-y-hidden pb-1",
          isFullWidth ? "w-full" : "w-fit max-w-full",
        ].join(" ");

  return (
    <>
      <div
        role="tablist"
        aria-label={tabsProps?.["aria-label"] ?? "app-tabs"}
        className={tabListClassName}
      >
        {items.map((tab, idx) => (
          <button
            key={String(tab.value)}
            type="button"
            role="tab"
            id={`${idBase}-tab-${idx}`}
            aria-selected={value === tab.value}
            aria-controls={`${idBase}-panel-${idx}`}
            disabled={tab.disabled}
            onClick={() => onChange(tab.value)}
            tabIndex={value === tab.value ? 0 : -1}
            onKeyDown={(event) => handleKeyDown(event, idx)}
            ref={(element) => {
              tabRefs.current[idx] = element;
            }}
            className={
              appearance === "mui-standard"
                ? [
                    "relative min-w-fit appearance-none border-0 bg-transparent px-4 py-3 text-sm font-medium shadow-none transition-colors outline-none focus:outline-none focus-visible:outline-none",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    "focus-visible:text-emerald-700",
                    isFullWidth ? "flex-1 whitespace-nowrap" : "whitespace-nowrap",
                    value === tab.value
                      ? "text-slate-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-emerald-600 after:content-['']"
                      : "text-slate-700 hover:text-slate-900",
                  ].join(" ")
                : [
                    "min-w-fit rounded-full border px-4 py-2 text-sm font-medium transition",
                    "disabled:cursor-not-allowed disabled:opacity-40",
                    isFullWidth ? "flex-1 whitespace-nowrap" : "whitespace-nowrap",
                    value === tab.value
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_10px_24px_-18px_rgba(16,185,129,0.8)]"
                      : "border-slate-300 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                  ].join(" ")
            }
          >
            {tab.label}
          </button>
        ))}
      </div>
      {items.map((tab, idx) => (
        <div
          key={`panel-${String(tab.value)}`}
          id={`${idBase}-panel-${idx}`}
          role="tabpanel"
          aria-labelledby={`${idBase}-tab-${idx}`}
          hidden={value !== tab.value}
          className="pt-3"
          style={{ paddingTop: `${panelPadding * 8}px` }}
        >
          {tab.content}
        </div>
      ))}
    </>
  );
}
