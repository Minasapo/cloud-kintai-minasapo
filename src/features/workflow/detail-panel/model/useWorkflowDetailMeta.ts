import type { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { useMemo } from "react";

import { getWorkflowCategoryLabel } from "@/entities/workflow/lib/workflowLabels";
import { buildWorkflowApprovalTimeline } from "@/features/workflow/approval-flow/model/workflowApprovalTimeline";
import type { WorkflowApprovalStepView } from "@/features/workflow/approval-flow/types";
import {
  deriveWorkflowDetailPermissions,
  type WorkflowDetailPermissions,
} from "@/features/workflow/detail-panel/model/workflowDetailPermissions";
import type { WorkflowEntity } from "@/features/workflow/hooks/useWorkflowLoaderWorkflow";
import { formatDateSlash, isoDateFromTimestamp } from "@/shared/lib/time";

type UseWorkflowDetailMetaParams = {
  workflow: WorkflowEntity | null | undefined;
  staffs: StaffType[];
};

type UseWorkflowDetailMetaReturn = {
  staffName: string;
  applicationDate: string;
  categoryLabel: string;
  approvalSteps: WorkflowApprovalStepView[];
  permissions: WorkflowDetailPermissions;
};

export function useWorkflowDetailMeta({
  workflow,
  staffs,
}: UseWorkflowDetailMetaParams): UseWorkflowDetailMetaReturn {
  const staffName = useMemo(() => {
    if (!workflow?.staffId) return "—";
    const s = staffs.find((st) => st.id === workflow.staffId);
    return s ? `${s.familyName} ${s.givenName}` : workflow.staffId;
  }, [workflow, staffs]);

  const applicationDate = formatDateSlash(
    isoDateFromTimestamp(workflow?.createdAt),
  );

  const categoryLabel = getWorkflowCategoryLabel(workflow ?? null);

  const approvalSteps = useMemo<WorkflowApprovalStepView[]>(
    () =>
      buildWorkflowApprovalTimeline({
        workflow: workflow ?? null,
        staffs,
        applicantName: staffName,
        applicationDate,
      }),
    [workflow, staffs, staffName, applicationDate],
  );

  const permissions = useMemo(
    () => deriveWorkflowDetailPermissions(workflow),
    [workflow],
  );

  return { staffName, applicationDate, categoryLabel, approvalSteps, permissions };
}
