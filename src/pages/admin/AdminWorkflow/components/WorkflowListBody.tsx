import { getWorkflowCategoryLabel } from "@entities/workflow/lib/workflowLabels";
import WorkflowStatusChip from "@entities/workflow/ui/WorkflowStatusChip";
import { Workflow as WorkflowType } from "@shared/api/graphql/types";
import { AppIconButton } from "@shared/ui/button";
import { SubsectionTitle } from "@shared/ui/typography";
import type { NavigateFunction } from "react-router-dom";

type WorkflowItem = {
  id: string;
  category?: WorkflowType["category"];
  status: WorkflowType["status"];
  staffId?: string | null;
  createdAt?: string | null;
};

type StaffItem = {
  id: string;
  familyName?: string | null;
  givenName?: string | null;
};

type WorkflowListBodyProps = {
  paginatedWorkflows: WorkflowItem[];
  isMobile: boolean;
  staffs: StaffItem[];
  navigate: NavigateFunction;
  onOpenInRightPanel: (workflowId: string) => void;
};

function OpenInPanelIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M7 5h8v8m0-8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 11v4H5V7h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function formatStaffName(staff?: StaffItem, staffId?: string | null) {
  if (!staff) return staffId || "不明";
  return `${staff.familyName || ""}${staff.givenName || ""}`;
}

export default function WorkflowListBody({
  paginatedWorkflows,
  isMobile,
  staffs,
  navigate,
  onOpenInRightPanel,
}: WorkflowListBodyProps) {
  if (isMobile) {
    return (
      <div className="space-y-2">
        {paginatedWorkflows.map((workflow) => {
          const staff = staffs.find((item) => item.id === workflow.staffId);
          const staffName = formatStaffName(staff, workflow.staffId);
          const categoryLabel = getWorkflowCategoryLabel(workflow);

          return (
            <article
              key={workflow.id}
              onClick={() => navigate(`/admin/workflow/${workflow.id}`)}
              className="cursor-pointer rounded-lg border border-slate-200 bg-white p-3 transition hover:border-emerald-400 hover:shadow-sm"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <SubsectionTitle className="m-0 text-sm font-semibold text-slate-900">
                  {categoryLabel}
                </SubsectionTitle>
                <AppIconButton
                  title="右側で開く"
                  aria-label="右側で開く"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenInRightPanel(workflow.id);
                  }}
                  tone="neutral"
                  size="sm"
                >
                  <OpenInPanelIcon />
                </AppIconButton>
              </div>

              <p className="mb-2 text-sm text-slate-800">{staffName}</p>

              <div className="flex items-center justify-between gap-2">
                <WorkflowStatusChip status={workflow.status} />
                <span className="text-xs text-slate-500">
                  {workflow.createdAt ? workflow.createdAt.split("T")[0] : ""}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-600">
            <th className="w-12 px-2 py-2" />
            <th className="px-2 py-2 font-medium">種別</th>
            <th className="px-2 py-2 font-medium">申請者</th>
            <th className="px-2 py-2 font-medium">ステータス</th>
            <th className="px-2 py-2 font-medium">作成日</th>
          </tr>
        </thead>
        <tbody>
          {paginatedWorkflows.map((workflow) => {
            const staff = staffs.find((item) => item.id === workflow.staffId);
            const staffName = formatStaffName(staff, workflow.staffId);
            const categoryLabel = getWorkflowCategoryLabel(workflow);

            return (
              <tr
                key={workflow.id}
                onClick={() => navigate(`/admin/workflow/${workflow.id}`)}
                className="cursor-pointer border-b border-slate-100 transition hover:bg-emerald-50/60"
              >
                <td
                  className="px-2 py-2"
                  onClick={(event) => event.stopPropagation()}
                >
                  <AppIconButton
                    title="右側で開く"
                    aria-label="右側で開く"
                    onClick={() => onOpenInRightPanel(workflow.id)}
                    tone="neutral"
                    size="sm"
                  >
                    <OpenInPanelIcon />
                  </AppIconButton>
                </td>
                <td className="px-2 py-2 text-slate-900">{categoryLabel}</td>
                <td className="px-2 py-2 text-slate-900">{staffName}</td>
                <td className="px-2 py-2">
                  <WorkflowStatusChip status={workflow.status} />
                </td>
                <td className="px-2 py-2 text-slate-600">
                  {workflow.createdAt ? workflow.createdAt.split("T")[0] : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
