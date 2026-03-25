import { Link as RouterLink } from "react-router-dom";

import InfoIconTooltip from "@/shared/ui/tooltip/InfoIconTooltip";

type AdminSummaryCardProps = {
  testId: string;
  title: string;
  description: string;
  countLabel: string;
  to: string;
  className?: string;
  showAdminOnlyTag: boolean;
  compact: boolean;
};

export default function AdminSummaryCard({
  testId,
  title,
  description,
  countLabel,
  to,
  className,
  showAdminOnlyTag,
  compact,
}: AdminSummaryCardProps) {
  const titleClassName = showAdminOnlyTag
    ? "m-0 text-[0.95rem] font-bold tracking-[0.01em] text-slate-900"
    : "m-0 text-[0.95rem] font-bold tracking-[0.01em] text-slate-900";
  const countClassName = compact
    ? "m-0 mt-1.5 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.15rem]"
    : showAdminOnlyTag
      ? "m-0 mt-2 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.25rem]"
      : "m-0 mt-1.5 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.25rem]";

  return (
    <RouterLink
      to={to}
      data-testid={testId}
      className={`group block rounded-[18px] no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 hover:no-underline ${className ?? ""}`}
    >
      <section
        className={`relative rounded-[18px] border-[1.5px] border-[rgba(148,163,184,0.42)] bg-white px-4 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.45)] transition group-hover:border-[rgba(148,163,184,0.55)] group-hover:shadow-[0_18px_32px_-22px_rgba(15,23,42,0.5)] ${compact ? "pt-2.5 pb-1.5" : "h-full pt-3 pb-2"}`}
      >
        <InfoIconTooltip
          testId={`${testId}-description-tooltip`}
          ariaLabel={description}
          tooltipContent={description}
          containerClassName="absolute right-3 top-3 inline-flex"
        />
        <div
          className={`flex flex-col items-start ${compact ? "min-h-[92px]" : "h-full min-h-[116px]"}`}
        >
          <div className={`min-w-0 pr-7 ${showAdminOnlyTag ? "pt-6" : ""}`}>
            {showAdminOnlyTag ? (
              <span className="absolute left-1 top-1 inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] text-slate-700">
                管理者のみ
              </span>
            ) : null}
            <h2 className={titleClassName}>{title}</h2>
          </div>
          <p className={countClassName}>{countLabel}</p>
        </div>
      </section>
    </RouterLink>
  );
}
