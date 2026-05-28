import { getWorkflowCategoryLabel } from "@entities/workflow/lib/workflowLabels";
import WorkflowStatusChip from "@entities/workflow/ui/WorkflowStatusChip";
import { Workflow as WorkflowType } from "@shared/api/graphql/types";

type WorkflowDetailGridProps = {
  currentWorkflow: WorkflowType;
  staffNamesById: Map<string, string>;
  currentIndex: number;
  totalCount: number;
};

export default function WorkflowDetailGrid({
  currentWorkflow,
  staffNamesById,
  currentIndex,
  totalCount,
}: WorkflowDetailGridProps) {
  return (
    <>
      <span className="inline-flex h-7 items-center rounded-full border border-slate-300 bg-slate-50 px-3 text-xs font-medium text-slate-700">
        {currentIndex + 1} / {totalCount}
      </span>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="m-0 text-xs text-slate-500">申請種別</p>
          <p className="m-0 mt-1 text-sm font-medium text-slate-900">
            {getWorkflowCategoryLabel(currentWorkflow)}
          </p>
        </div>

        <div>
          <p className="m-0 text-xs text-slate-500">申請者</p>
          <p className="m-0 mt-1 text-sm font-medium text-slate-900">
            {staffNamesById.get(currentWorkflow.staffId || "") || "不明"}
          </p>
        </div>

        <div>
          <p className="m-0 text-xs text-slate-500">申請日</p>
          <p className="m-0 mt-1 text-sm font-medium text-slate-900">
            {currentWorkflow.createdAt ? currentWorkflow.createdAt.split("T")[0] : "-"}
          </p>
        </div>

        <div>
          <p className="m-0 text-xs text-slate-500">ステータス</p>
          <div className="mt-1">
            <WorkflowStatusChip status={currentWorkflow.status} />
          </div>
        </div>

        <div>
          <p className="m-0 text-xs text-slate-500">承認ステップ</p>
          <p className="m-0 mt-1 text-sm font-medium text-slate-900">
            {(currentWorkflow.approvalSteps?.length ?? 0) > 0
              ? `${currentWorkflow.approvalSteps?.length} 件`
              : "未設定"}
          </p>
        </div>

        <div>
          <p className="m-0 text-xs text-slate-500">コメント</p>
          <p className="m-0 mt-1 text-sm font-medium text-slate-900">
            {(currentWorkflow.comments?.length ?? 0) > 0
              ? `${currentWorkflow.comments?.length} 件`
              : "コメントなし"}
          </p>
        </div>
      </div>
    </>
  );
}
