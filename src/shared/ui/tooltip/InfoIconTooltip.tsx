import type { ReactNode } from "react";

type InfoIconTooltipProps = {
  testId: string;
  ariaLabel: string;
  tooltipContent: ReactNode;
  containerClassName?: string;
  tooltipClassName?: string;
  iconClassName?: string;
  iconElement?: "button" | "span";
};

export default function InfoIconTooltip({
  testId,
  ariaLabel,
  tooltipContent,
  containerClassName = "relative inline-flex",
  tooltipClassName,
  iconClassName,
  iconElement = "button",
}: InfoIconTooltipProps) {
  const mergedIconClassName = `peer inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600 ${iconClassName ?? ""}`;

  return (
    <span className={containerClassName}>
      {iconElement === "button" ? (
        <button
          type="button"
          data-testid={testId}
          aria-label={ariaLabel}
          className={mergedIconClassName}
        >
          i
        </button>
      ) : (
        <span
          data-testid={testId}
          aria-label={ariaLabel}
          className={mergedIconClassName}
        >
          i
        </span>
      )}
      <span
        className={`pointer-events-none absolute right-0 top-7 z-10 w-max max-w-[220px] rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100 ${tooltipClassName ?? ""}`}
      >
        {tooltipContent}
      </span>
    </span>
  );
}
