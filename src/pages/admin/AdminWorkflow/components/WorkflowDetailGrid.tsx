import { getWorkflowCategoryLabel } from "@entities/workflow/lib/workflowLabels";
import WorkflowStatusChip from "@entities/workflow/ui/WorkflowStatusChip";
import {
  Workflow as WorkflowType,
  WorkflowCategory,
} from "@shared/api/graphql/types";
import { formatDateSlash } from "@shared/lib/time";

type WorkflowDetailGridProps = {
  currentWorkflow: WorkflowType;
  staffNamesById: Map<string, string>;
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="m-0 text-xs text-slate-500">{label}</p>
      <p className="m-0 mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default function WorkflowDetailGrid({
  currentWorkflow,
  staffNamesById,
}: WorkflowDetailGridProps) {
  const {
    category,
    overTimeDetails,
    customWorkflowTitle,
    customWorkflowContent,
  } = currentWorkflow;

  const isPaidLeave = category === WorkflowCategory.PAID_LEAVE;
  const isAbsence = category === WorkflowCategory.ABSENCE;
  const isOvertime = category === WorkflowCategory.OVERTIME;
  const isClockCorrection = category === WorkflowCategory.CLOCK_CORRECTION;
  const isCustom = category === WorkflowCategory.CUSTOM;
  const isCompensatoryLeave = category === WorkflowCategory.COMPENSATORY_LEAVE;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <DetailItem
        label="申請種別"
        value={getWorkflowCategoryLabel(currentWorkflow)}
      />

      <DetailItem
        label="申請者"
        value={staffNamesById.get(currentWorkflow.staffId || "") || "不明"}
      />

      <DetailItem
        label="申請日"
        value={
          currentWorkflow.createdAt
            ? currentWorkflow.createdAt.split("T")[0].replace(/-/g, "/")
            : "-"
        }
      />

      <div>
        <p className="m-0 text-xs text-slate-500">ステータス</p>
        <div className="mt-1">
          <WorkflowStatusChip status={currentWorkflow.status} />
        </div>
      </div>

      {isPaidLeave && (
        <>
          <DetailItem
            label="取得期間"
            value={
              overTimeDetails?.startTime && overTimeDetails?.endTime
                ? overTimeDetails.startTime === overTimeDetails.endTime
                  ? formatDateSlash(overTimeDetails.startTime)
                  : `${formatDateSlash(overTimeDetails.startTime)} ～ ${formatDateSlash(overTimeDetails.endTime)}`
                : "-"
            }
          />
          {overTimeDetails?.reason && (
            <DetailItem label="申請理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isAbsence && (
        <>
          <DetailItem
            label="欠勤日"
            value={formatDateSlash(overTimeDetails?.date) || "-"}
          />
          {overTimeDetails?.reason && (
            <DetailItem label="申請理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isOvertime && (
        <>
          <DetailItem
            label="残業予定日"
            value={formatDateSlash(overTimeDetails?.date) || "-"}
          />
          <DetailItem
            label="残業予定時間"
            value={
              overTimeDetails?.startTime
                ? `${overTimeDetails.startTime} - ${overTimeDetails.endTime ?? ""}`
                : "-"
            }
          />
          {overTimeDetails?.reason && (
            <DetailItem label="残業理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isClockCorrection && (
        <>
          <DetailItem
            label="対象日"
            value={formatDateSlash(overTimeDetails?.date) || "-"}
          />
          <DetailItem
            label="修正時刻"
            value={
              overTimeDetails?.startTime || overTimeDetails?.endTime
                ? `${overTimeDetails?.startTime || overTimeDetails?.endTime}`
                : "-"
            }
          />
          {overTimeDetails?.reason && (
            <DetailItem label="修正理由" value={overTimeDetails.reason} />
          )}
        </>
      )}

      {isCustom && (
        <>
          <DetailItem label="タイトル" value={customWorkflowTitle || "-"} />
          <DetailItem label="詳細" value={customWorkflowContent || "-"} />
        </>
      )}

      {isCompensatoryLeave && (
        <>
          <DetailItem
            label="振替対象日"
            value={formatDateSlash(overTimeDetails?.date) || "-"}
          />
          <DetailItem
            label="振替取得日"
            value={formatDateSlash(overTimeDetails?.startTime) || "-"}
          />
          {overTimeDetails?.reason && (
            <DetailItem label="理由" value={overTimeDetails.reason} />
          )}
        </>
      )}
    </div>
  );
}
