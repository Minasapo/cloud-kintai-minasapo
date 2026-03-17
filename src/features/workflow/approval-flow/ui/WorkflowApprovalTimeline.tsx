import { designTokenVar } from "@/shared/designSystem";
import StatusChip from "@/shared/ui/chips/StatusChip";

import type { WorkflowApprovalStepView } from "../types";

type Props = {
  title?: string;
  steps: WorkflowApprovalStepView[];
};

const TIMELINE_TITLE_COLOR = designTokenVar("color.text.primary", "#1E2A25");
const TIMELINE_SURFACE_BG = designTokenVar("color.surface.primary", "#FFFFFF");
const TIMELINE_SURFACE_BORDER = designTokenVar("color.border.subtle", "#D7E0DB");
const TIMELINE_SURFACE_RADIUS = designTokenVar("radius.md", "8px");
const TIMELINE_SURFACE_PADDING = designTokenVar("spacing.lg", "16px");
const STEP_GAP = designTokenVar("spacing.lg", "16px");
const STEP_MUTED_TEXT = designTokenVar("color.text.muted", "#5E7268");
const APPLICANT_BADGE_BG = designTokenVar("color.neutral.400", "#A5B3AC");
const DONE_BADGE_BG = designTokenVar("color.feedback.success.base", "#1EAA6A");
const ACTIVE_BADGE_BG = designTokenVar("color.brand.primary.base", "#0FA85E");
const BADGE_TEXT = designTokenVar("color.neutral.0", "#FFFFFF");
const BADGE_RADIUS = designTokenVar("radius.md", "8px");

export default function WorkflowApprovalTimeline({
  title = "承認フロー",
  steps,
}: Props) {
  return (
    <section className="mt-6">
      <h2
        className="mb-3 text-lg font-semibold"
        style={{ color: TIMELINE_TITLE_COLOR }}
      >
        {title}
      </h2>
      <div
        className="flex flex-col"
        style={{
          gap: STEP_GAP,
          backgroundColor: TIMELINE_SURFACE_BG,
          border: `1px solid ${TIMELINE_SURFACE_BORDER}`,
          borderRadius: TIMELINE_SURFACE_RADIUS,
          padding: TIMELINE_SURFACE_PADDING,
        }}
      >
        {steps.map((step, idx) => {
          const isApplicant = step.role === "申請者";
          const active =
            step.state === "承認済み"
              ? "done"
              : step.state === "未承認"
                ? "pending"
                : "";
          const badgeBackground = isApplicant
            ? APPLICANT_BADGE_BG
            : active === "done"
              ? DONE_BADGE_BG
              : ACTIVE_BADGE_BG;

          return (
            <div
              key={step.id}
              className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center font-bold"
                  style={{
                    borderRadius: BADGE_RADIUS,
                    backgroundColor: badgeBackground,
                    color: BADGE_TEXT,
                  }}
                >
                  {idx === 0 ? "申" : idx}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-bold">{step.name}</div>
                  <div className="text-xs" style={{ color: STEP_MUTED_TEXT }}>
                    {step.role} {step.date ? `・${step.date}` : ""}
                  </div>
                </div>
              </div>
              {!isApplicant && (
                <div className="sm:ml-auto">
                  <StatusChip status={step.state} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
