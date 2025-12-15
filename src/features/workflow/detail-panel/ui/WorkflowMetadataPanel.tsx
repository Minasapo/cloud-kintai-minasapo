import { Grid, Typography } from "@mui/material";
import { WorkflowCategory, WorkflowStatus } from "@shared/api/graphql/types";
import StatusChip from "@shared/ui/chips/StatusChip";

import { formatDateSlash } from "@/lib/date";

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
  } | null;
  approvalSteps: WorkflowApprovalStepView[];
};

export default function WorkflowMetadataPanel({
  workflowId,
  fallbackId,
  category,
  categoryLabel,
  staffName,
  applicationDate,
  status,
  overTimeDetails,
  approvalSteps,
}: WorkflowMetadataPanelProps) {
  const displayId = workflowId ?? fallbackId ?? "-";
  const isOvertime = category === WorkflowCategory.OVERTIME;
  const overtimeDate = formatDateSlash(overTimeDetails?.date);
  const overtimeTimeRange = overTimeDetails?.startTime
    ? `${overTimeDetails.startTime} - ${overTimeDetails?.endTime ?? ""}`
    : "-";

  return (
    <Grid container rowSpacing={2} columnSpacing={1} alignItems="center">
      <Grid item xs={12} sm={3}>
        <Typography variant="body2" color="text.secondary">
          ID
        </Typography>
      </Grid>
      <Grid item xs={12} sm={9}>
        <Typography>{displayId}</Typography>
      </Grid>

      <Grid item xs={12} sm={3}>
        <Typography variant="body2" color="text.secondary">
          種別
        </Typography>
      </Grid>
      <Grid item xs={12} sm={9}>
        <Typography>{categoryLabel}</Typography>
      </Grid>

      <Grid item xs={12} sm={3}>
        <Typography variant="body2" color="text.secondary">
          申請者
        </Typography>
      </Grid>
      <Grid item xs={12} sm={9}>
        <Typography>{staffName}</Typography>
      </Grid>

      <Grid item xs={12} sm={3}>
        <Typography variant="body2" color="text.secondary">
          申請日
        </Typography>
      </Grid>
      <Grid item xs={12} sm={9}>
        <Typography>{applicationDate}</Typography>
      </Grid>

      <Grid item xs={12} sm={3}>
        <Typography variant="body2" color="text.secondary">
          ステータス
        </Typography>
      </Grid>
      <Grid item xs={12} sm={9}>
        <StatusChip status={status} />
      </Grid>

      {isOvertime && (
        <>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              残業予定日
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Typography>{overtimeDate || "-"}</Typography>
          </Grid>

          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              残業予定時間
            </Typography>
          </Grid>
          <Grid item xs={12} sm={9}>
            <Typography>{overtimeTimeRange}</Typography>
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <WorkflowApprovalTimeline steps={approvalSteps} />
      </Grid>
    </Grid>
  );
}
