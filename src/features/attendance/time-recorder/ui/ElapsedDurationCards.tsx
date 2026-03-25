import type { TimeRecorderElapsedWorkInfo } from "./TimeRecorder";

type ElapsedDurationCardsProps = {
  elapsedWorkInfo: TimeRecorderElapsedWorkInfo;
};

export default function ElapsedDurationCards({
  elapsedWorkInfo,
}: ElapsedDurationCardsProps) {
  const infoIconClassName =
    "peer inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-[11px] font-semibold leading-none text-slate-600";

  if (!elapsedWorkInfo.visible) {
    return null;
  }

  return (
    <div
      data-testid="register-dashboard-elapsed-duration-cards"
      className="grid grid-cols-2 gap-4"
    >
      <section
        data-testid="register-dashboard-current-work-card"
        className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-xs font-semibold tracking-[0.03em] text-slate-700">
            現在の勤務時間
          </p>
          <span className="relative inline-flex">
            <button
              type="button"
              data-testid="register-dashboard-current-work-info"
              aria-label="休憩時間を差し引いた勤務時間を表示します"
              className={infoIconClassName}
            >
              i
            </button>
            <span className="pointer-events-none absolute right-0 top-7 z-10 w-max max-w-[220px] rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100">
              休憩時間を差し引いた勤務時間を表示します
            </span>
          </span>
        </div>
        <div className="mt-2 flex items-end justify-end">
          <p className="m-0 shrink-0 text-3xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
            {elapsedWorkInfo.workDurationLabel}
          </p>
        </div>
      </section>
      <section
        data-testid="register-dashboard-current-rest-card"
        className="w-full rounded-[1.35rem] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-xs font-semibold tracking-[0.03em] text-slate-700">
            現在の休憩時間
          </p>
          <span className="relative inline-flex">
            <button
              type="button"
              data-testid="register-dashboard-current-rest-info"
              aria-label="休憩中のみカウントします"
              className={infoIconClassName}
            >
              i
            </button>
            <span className="pointer-events-none absolute right-0 top-7 z-10 w-max max-w-[220px] rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium leading-tight text-white opacity-0 shadow-md transition-opacity duration-150 peer-hover:opacity-100 peer-focus-visible:opacity-100">
              休憩中のみカウントします
            </span>
          </span>
        </div>
        <div className="mt-2 flex items-end justify-end">
          <p className="m-0 shrink-0 text-3xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
            {elapsedWorkInfo.restDurationLabel}
          </p>
        </div>
      </section>
    </div>
  );
}
