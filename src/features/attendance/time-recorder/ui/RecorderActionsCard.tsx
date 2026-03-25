import ClockInButton from "@/shared/ui/time-recorder/ClockInButton";
import ClockOutButton from "@/shared/ui/time-recorder/ClockOutButton";
import DirectSwitch from "@/shared/ui/time-recorder/DirectSwitch";
import GoDirectlyButton from "@/shared/ui/time-recorder/GoDirectlyButton";
import RestEndButton from "@/shared/ui/time-recorder/RestEndButton";
import RestStartButton from "@/shared/ui/time-recorder/RestStartButton";
import ReturnDirectlyButton from "@/shared/ui/time-recorder/ReturnDirectlyButton";

type RecorderActionsCardProps = {
  directMode: boolean;
  hasChangeRequest: boolean;
  isBeforeWork: boolean;
  isWorking: boolean;
  isResting: boolean;
  onDirectModeChange: (checked: boolean) => void;
  onClockIn: () => void;
  onClockOut: () => void;
  onGoDirectly: () => void;
  onReturnDirectly: () => void;
  onRestStart: () => void;
  onRestEnd: () => void;
};

function HelpTooltip({ message }: { message: string }) {
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={message}
        className="group inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-300 bg-white text-emerald-700 shadow-sm transition hover:border-emerald-400 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="10" cy="10" r="7" />
          <path d="M8.9 7.7a1.6 1.6 0 1 1 2.3 1.4c-.7.3-1.2.8-1.2 1.6" />
          <path d="M10 13.8h.01" />
        </svg>
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-48 -translate-x-1/2 rounded-xl bg-slate-950 px-3 py-2 text-left text-xs font-medium leading-5 text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.9)] group-hover:block group-focus-visible:block">
          {message}
        </span>
      </button>
    </span>
  );
}

export default function RecorderActionsCard({
  directMode,
  hasChangeRequest,
  isBeforeWork,
  isWorking,
  isResting,
  onDirectModeChange,
  onClockIn,
  onClockOut,
  onGoDirectly,
  onReturnDirectly,
  onRestStart,
  onRestEnd,
}: RecorderActionsCardProps) {
  return (
    <section className="rounded-[1.5rem] bg-white/75 p-3 shadow-[0_28px_52px_-40px_rgba(15,23,42,0.35)] backdrop-blur-sm md:rounded-[1.6rem] md:p-4">
      <div className="mb-3 rounded-[1.25rem] border border-emerald-200/80 bg-[linear-gradient(135deg,#f0fdf4_0%,#ffffff_100%)] p-3 shadow-[0_20px_40px_-36px_rgba(15,168,94,0.55)] md:mb-4 md:rounded-[1.3rem] md:p-3.5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <p className="m-0 text-sm font-semibold text-slate-900 md:text-base">
              直行 / 直帰
            </p>
            <HelpTooltip message="直行や直帰の日だけ切り替えると、対応する打刻ボタンに切り替わります。" />
          </div>
          <label className="inline-flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white px-3 py-2.5 md:self-auto md:px-4 md:py-3">
            <DirectSwitch
              checked={directMode}
              onChange={(event) => onDirectModeChange(event.target.checked)}
              data-testid="direct-mode-switch"
            />
            <span className="text-xs font-semibold text-slate-900 md:text-sm">
              直行/直帰モードを使う
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:mx-auto md:max-w-[620px] md:gap-3">
        <div className="flex">
          {directMode ? (
            <GoDirectlyButton
              key={String(isBeforeWork)}
              isBeforeWork={isBeforeWork}
              onGoDirectly={onGoDirectly}
              disabled={hasChangeRequest}
            />
          ) : (
            <ClockInButton
              key={String(isBeforeWork)}
              isBeforeWork={isBeforeWork}
              onClockIn={onClockIn}
              disabled={hasChangeRequest}
            />
          )}
        </div>
        <div className="flex">
          {directMode ? (
            <ReturnDirectlyButton
              key={String(isWorking)}
              isWorking={isWorking}
              onReturnDirectly={onReturnDirectly}
              disabled={hasChangeRequest}
            />
          ) : (
            <ClockOutButton
              key={String(isWorking)}
              isWorking={isWorking}
              onClockOut={onClockOut}
              disabled={hasChangeRequest}
            />
          )}
        </div>
        <div className="flex">
          <RestStartButton
            key={String(isWorking)}
            isWorking={isWorking}
            onRestStart={onRestStart}
            disabled={hasChangeRequest}
          />
        </div>
        <div className="flex">
          <RestEndButton
            key={String(isResting)}
            isResting={isResting}
            onRestEnd={onRestEnd}
            disabled={hasChangeRequest}
          />
        </div>
      </div>
    </section>
  );
}
