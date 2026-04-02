import InfoIconTooltip from "@/shared/ui/tooltip/InfoIconTooltip";

import type { TimeRecorderElapsedWorkInfo } from "./TimeRecorder";

type ElapsedDurationCardsProps = {
  elapsedWorkInfo: TimeRecorderElapsedWorkInfo;
};

type DurationSectionCardProps = {
  cardTestId: string;
  infoTestId: string;
  title: string;
  infoLabel: string;
  durationLabel: string;
};

function DurationSectionCard({
  cardTestId,
  infoTestId,
  title,
  infoLabel,
  durationLabel,
}: DurationSectionCardProps) {
  return (
    <section
      data-testid={cardTestId}
      className="w-full rounded-[4px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="m-0 text-xs font-semibold tracking-[0.03em] text-slate-700">
          {title}
        </p>
        <InfoIconTooltip
          testId={infoTestId}
          ariaLabel={infoLabel}
          tooltipContent={infoLabel}
        />
      </div>
      <div className="mt-2 flex items-end justify-start">
        <p className="m-0 shrink-0 text-3xl font-extrabold leading-none tracking-[-0.03em] text-slate-950">
          {durationLabel}
        </p>
      </div>
    </section>
  );
}

export default function ElapsedDurationCards({
  elapsedWorkInfo,
}: ElapsedDurationCardsProps) {
  if (!elapsedWorkInfo.visible) {
    return null;
  }

  return (
    <div
      data-testid="register-dashboard-elapsed-duration-cards"
      className="grid grid-cols-2 gap-4"
    >
      <DurationSectionCard
        cardTestId="register-dashboard-current-work-card"
        infoTestId="register-dashboard-current-work-info"
        title="現在の勤務時間"
        infoLabel="休憩時間を差し引いた勤務時間を表示します"
        durationLabel={elapsedWorkInfo.workDurationLabel}
      />
      <DurationSectionCard
        cardTestId="register-dashboard-current-rest-card"
        infoTestId="register-dashboard-current-rest-info"
        title="現在の休憩時間"
        infoLabel="休憩中のみカウントします"
        durationLabel={elapsedWorkInfo.restDurationLabel}
      />
    </div>
  );
}
