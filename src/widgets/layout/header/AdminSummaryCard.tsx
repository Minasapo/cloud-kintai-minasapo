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
  visualVariant?: "default" | "dashboard";
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
  visualVariant = "default",
}: AdminSummaryCardProps) {
  const isDashboardVariant = visualVariant === "dashboard";
  const titleClassName = showAdminOnlyTag
    ? "m-0 text-[0.95rem] font-bold tracking-[0.01em] text-slate-900"
    : "m-0 text-[0.95rem] font-bold tracking-[0.01em] text-slate-900";
  const countClassName = isDashboardVariant
    ? "m-0 mt-1 text-[2rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-slate-950 md:text-[2.25rem]"
    : compact
      ? "m-0 mt-1.5 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.15rem]"
      : showAdminOnlyTag
        ? "m-0 mt-2 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.25rem]"
        : "m-0 mt-1.5 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.25rem]";
  const linkClassName = isDashboardVariant
    ? "block h-full rounded-[6px] no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 hover:no-underline"
    : `group block rounded-[8px] no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 hover:no-underline ${className ?? ""}`;
  const sectionClassName = isDashboardVariant
    ? "relative flex h-full min-h-[140px] flex-col rounded-[6px] border-[1.5px] border-solid border-[rgba(148,163,184,0.42)] bg-white px-3 py-3 md:px-4 md:py-[10px] shadow-[0_14px_28px_-24px_rgba(15,23,42,0.45)]"
    : `relative rounded-[8px] border-[1.5px] border-solid border-[rgba(148,163,184,0.42)] bg-white px-4 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.45)] transition group-hover:border-[rgba(148,163,184,0.55)] group-hover:shadow-[0_18px_32px_-22px_rgba(15,23,42,0.5)] ${compact ? "pt-2.5 pb-1.5" : "h-full pt-3 pb-2"} ${className ?? ""}`;
  const contentClassName = isDashboardVariant
    ? "flex h-full flex-col items-start"
    : `flex flex-col items-start ${compact ? "min-h-[92px]" : "h-full min-h-[116px]"}`;
  const titleWrapperClassName = isDashboardVariant
    ? "min-w-0 pr-7"
    : `min-w-0 pr-7 ${showAdminOnlyTag ? "pt-6" : ""}`;
  const adminOnlyTagClassName = isDashboardVariant
    ? "inline-flex items-center rounded-full border border-solid border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] text-slate-700"
    : "absolute left-1 top-1 inline-flex items-center rounded-full border border-solid border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] text-slate-700";
  const iconContainerClassName = isDashboardVariant
    ? "absolute right-4 top-3 inline-flex"
    : "absolute right-3 top-3 inline-flex";

  return (
    <RouterLink to={to} data-testid={testId} className={linkClassName}>
      <section className={sectionClassName}>
        <InfoIconTooltip
          testId={`${testId}-description-tooltip`}
          ariaLabel={description}
          tooltipContent={description}
          containerClassName={iconContainerClassName}
        />
        <div className={contentClassName}>
          <div className={titleWrapperClassName}>
            {showAdminOnlyTag ? (
              <span
                className={adminOnlyTagClassName}
                data-testid={`${testId}-admin-only-tag`}
              >
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
