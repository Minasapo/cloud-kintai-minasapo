import Clock from "@shared/ui/clock/Clock";
import { SectionTitle } from "@shared/ui/typography";
import type { ReactNode } from "react";

type RecorderStatusCardProps = {
  workStatusText: string;
  clockInDisplayText: string | null;
  clockOutDisplayText: string | null;
};

function WorkStatusHeading({ text }: { text: string }) {
  return (
    <div className="recorder-status-card__title-wrap">
      <SectionTitle
        className="recorder-status-card__title"
        data-testid="work-status-text"
      >
        {text}
      </SectionTitle>
    </div>
  );
}

function StatusBadge({
  tone,
  testId,
  children,
}: {
  tone: "success" | "danger";
  testId: string;
  children: ReactNode;
}) {
  return (
    <p
      className={[
        "recorder-status-card__badge",
        `recorder-status-card__badge--${tone}`,
      ].join(" ")}
      data-testid={testId}
    >
      {children}
    </p>
  );
}

function RecorderTimeBadges({
  clockInDisplayText,
  clockOutDisplayText,
}: {
  clockInDisplayText: string | null;
  clockOutDisplayText: string | null;
}) {
  if (!clockInDisplayText && !clockOutDisplayText) {
    return null;
  }

  return (
    <div className="recorder-status-card__badges">
      {clockInDisplayText && (
        <StatusBadge tone="success" testId="clock-in-time-text">
          {clockInDisplayText}
        </StatusBadge>
      )}
      {clockOutDisplayText && (
        <StatusBadge tone="danger" testId="clock-out-time-text">
          {clockOutDisplayText}
        </StatusBadge>
      )}
    </div>
  );
}

export default function RecorderStatusCard({
  workStatusText,
  clockInDisplayText,
  clockOutDisplayText,
}: RecorderStatusCardProps) {
  return (
    <div className="recorder-status-card">
      <div className="recorder-status-card__body">
        <WorkStatusHeading text={workStatusText} />
        <Clock />
      </div>

      <RecorderTimeBadges
        clockInDisplayText={clockInDisplayText}
        clockOutDisplayText={clockOutDisplayText}
      />
    </div>
  );
}
