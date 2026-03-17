import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import StatusChip from "@shared/ui/chips/StatusChip";
import type { ReactNode } from "react";

import { designTokenVar } from "@/shared/designSystem";
import { formatDateSlash } from "@/shared/lib/time";

import type { WorkflowApprovalStepView } from "../../approval-flow/types";
import WorkflowApprovalTimeline from "../../approval-flow/ui/WorkflowApprovalTimeline";

type WorkflowMetadataPanelProps = {
  workflowId?: string | null;
  fallbackId?: string;
  category?: WorkflowCategory | null;
  categoryLabel: string;
  staffName: string;
  applicationDate: string;
  status?: WorkflowStatus | null;
  overTimeDetails?: {
    date?: string | null;
    startTime?: string | null;
    endTime?: string | null;
    reason?: string | null;
  } | null;
  customWorkflowTitle?: string | null;
  customWorkflowContent?: string | null;
  approvalSteps: WorkflowApprovalStepView[];
};

const PANEL_BACKGROUND = designTokenVar("color.surface.primary", "#FFFFFF");
const PANEL_BORDER = designTokenVar("color.border.subtle", "#D7E0DB");
const PANEL_RADIUS = designTokenVar("radius.lg", "12px");
const PANEL_PADDING = designTokenVar("spacing.xl", "24px");
const LABEL_COLOR = designTokenVar("color.text.muted", "#5E7268");

type MetadataRowProps = {
  label: string;
  value: ReactNode;
  preserveWhitespace?: boolean;
};

function MetadataRow({
  label,
  value,
  preserveWhitespace = false,
}: MetadataRowProps) {
  return (
    <>
      <div className="text-sm font-medium sm:py-1" style={{ color: LABEL_COLOR }}>
        {label}
      </div>
      <div
        className={[
          "min-w-0 text-[15px] leading-7 text-slate-800 sm:leading-8",
          preserveWhitespace ? "whitespace-pre-wrap" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </div>
    </>
  );
}

export default function WorkflowMetadataPanel({
  workflowId,
  fallbackId,
  category,
  categoryLabel,
  staffName,
  applicationDate,
  status,
  overTimeDetails,
  customWorkflowTitle,
  customWorkflowContent,
  approvalSteps,
}: WorkflowMetadataPanelProps) {
  const displayId = workflowId ?? fallbackId ?? "-";
  const isOvertime = category === WorkflowCategory.OVERTIME;
  const isPaidLeave = category === WorkflowCategory.PAID_LEAVE;
  const isAbsence = category === WorkflowCategory.ABSENCE;
  const isClockCorrection = category === WorkflowCategory.CLOCK_CORRECTION;
  const isCustom = category === WorkflowCategory.CUSTOM;

  const overtimeDate = formatDateSlash(overTimeDetails?.date);
  const overtimeTimeRange = overTimeDetails?.startTime
    ? `${overTimeDetails.startTime} - ${overTimeDetails?.endTime ?? ""}`
    : "-";

  return (
    <section
      className="grid grid-cols-1 items-start gap-x-5 gap-y-5 overflow-hidden md:grid-cols-[minmax(7rem,9.5rem)_minmax(0,1fr)] lg:grid-cols-[minmax(8rem,11rem)_minmax(0,1fr)]"
      style={{
        backgroundColor: PANEL_BACKGROUND,
        border: `1px solid ${PANEL_BORDER}`,
        borderRadius: PANEL_RADIUS,
        padding: PANEL_PADDING,
      }}
    >
      <MetadataRow label="ID" value={displayId} />
      <MetadataRow label="種別" value={categoryLabel} />
      <MetadataRow label="申請者" value={staffName} />
      <MetadataRow label="申請日" value={applicationDate} />
      <MetadataRow label="ステータス" value={<StatusChip status={status} />} />

      {isPaidLeave && (
        <>
          <MetadataRow
            label="取得期間"
            value={
              overTimeDetails?.startTime && overTimeDetails?.endTime
                ? overTimeDetails.startTime === overTimeDetails.endTime
                  ? formatDateSlash(overTimeDetails.startTime)
                  : `${formatDateSlash(overTimeDetails.startTime)} ～ ${formatDateSlash(
                      overTimeDetails.endTime
                    )}`
                : "-"
            }
          />
          {overTimeDetails?.reason && (
            <MetadataRow label="申請理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isAbsence && (
        <>
          <MetadataRow label="欠勤日" value={formatDateSlash(overTimeDetails?.date) || "-"} />
          {overTimeDetails?.reason && (
            <MetadataRow label="申請理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isOvertime && (
        <>
          <MetadataRow label="残業予定日" value={overtimeDate || "-"} />
          <MetadataRow label="残業予定時間" value={overtimeTimeRange} />
          {overTimeDetails?.reason && (
            <MetadataRow label="残業理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isClockCorrection && (
        <>
          <MetadataRow label="対象日" value={formatDateSlash(overTimeDetails?.date) || "-"} />
          <MetadataRow
            label="修正時刻"
            value={
              overTimeDetails?.startTime || overTimeDetails?.endTime
                ? `${overTimeDetails.startTime || overTimeDetails.endTime}`
                : "-"
            }
          />
          {overTimeDetails?.reason && (
            <MetadataRow label="修正理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isCustom && (
        <>
          <MetadataRow label="タイトル" value={customWorkflowTitle || "-"} />
          <MetadataRow
            label="詳細"
            value={customWorkflowContent || "-"}
            preserveWhitespace
          />
        </>
      )}

      <div className="sm:col-span-2">
        <WorkflowApprovalTimeline steps={approvalSteps} />
      </div>
    </section>
  );
}
