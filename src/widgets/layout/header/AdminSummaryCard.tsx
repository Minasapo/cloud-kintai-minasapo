import { Link as RouterLink } from "react-router-dom";

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
    ? "mt-2 m-0 text-[0.95rem] font-bold tracking-[0.01em] text-slate-900"
    : "m-0 text-[0.95rem] font-bold tracking-[0.01em] text-slate-900";
  const countClassName = compact
    ? "m-0 mt-auto pt-2 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.15rem]"
    : showAdminOnlyTag
      ? "m-0 mt-auto pt-4 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.25rem]"
      : "m-0 mt-auto pt-3 text-[2rem] font-extrabold leading-none tracking-[-0.03em] text-slate-950 md:text-[2.25rem]";
  const infoIconClassName =
    "peer inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600";

  return (
    <RouterLink
      to={to}
      data-testid={testId}
      className={`group block rounded-[18px] no-underline transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70 hover:no-underline ${className ?? ""}`}
    >
      <section
        className={`relative rounded-[18px] border-[1.5px] border-[rgba(148,163,184,0.42)] bg-white px-4 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.45)] transition group-hover:border-[rgba(148,163,184,0.55)] group-hover:shadow-[0_18px_32px_-22px_rgba(15,23,42,0.5)] ${compact ? "py-3" : "h-full py-[0.95rem]"}`}
      >
        <span className="absolute right-3 top-3 inline-flex">
          <span
            data-testid={`${testId}-description-tooltip`}
            aria-label={description}
            className={infoIconClassName}
          >
            i
          </span>
          <span className="pointer-events-none absolute right-0 top-7 z-10 w-max max-w-[220px] rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100">
            {description}
          </span>
        </span>
        <div
          className={`flex flex-col items-start ${compact ? "min-h-[104px]" : "h-full min-h-[132px]"}`}
        >
          <div className="min-w-0 pr-7">
            {showAdminOnlyTag ? (
              <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em] text-slate-700">
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
