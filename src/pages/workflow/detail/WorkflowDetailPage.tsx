import { Grid, Paper, Stack, Typography } from "@mui/material";
import { getWorkflow } from "@shared/api/graphql/documents/queries";
import {
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowComment,
  WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import Page from "@shared/ui/page/Page";
import { GraphQLResult } from "aws-amplify/api";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatchV2 } from "@/app/hooks";
import { AuthContext } from "@/context/AuthContext";
import { buildWorkflowApprovalTimeline } from "@/features/workflow/approval-flow/model/workflowApprovalTimeline";
import type { WorkflowApprovalStepView } from "@/features/workflow/approval-flow/types";
import useWorkflowCommentThread from "@/features/workflow/comment-thread/model/useWorkflowCommentThread";
import WorkflowCommentThread from "@/features/workflow/comment-thread/ui/WorkflowCommentThread";
import { deriveWorkflowDetailPermissions } from "@/features/workflow/detail-panel/model/workflowDetailPermissions";
import WorkflowApplicationDetails from "@/features/workflow/detail-panel/ui/WorkflowApplicationDetails";
import WorkflowDetailActions from "@/features/workflow/detail-panel/ui/WorkflowDetailActions";
import WorkflowMetadataPanel from "@/features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import useStaffs from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
import { graphqlClient } from "@/lib/amplify/graphqlClient";
import { formatDateSlash, isoDateFromTimestamp } from "@/lib/date";
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/lib/reducers/snackbarReducer";
import { CATEGORY_LABELS } from "@/lib/workflowLabels";

export default function WorkflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { staffs } = useStaffs();
  const { cognitoUser } = useContext(AuthContext);
  const { update: updateWorkflow } = useWorkflows();

  const [workflow, setWorkflow] = useState<NonNullable<
    GetWorkflowQuery["getWorkflow"]
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatchV2();

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const resp = (await graphqlClient.graphql({
          query: getWorkflow,
          variables: { id },
          authMode: "userPool",
        })) as GraphQLResult<GetWorkflowQuery>;

        if (resp.errors) throw new Error(resp.errors[0].message);

        if (!resp.data?.getWorkflow) {
          setError("指定されたワークフローが見つかりませんでした");
          setWorkflow(null);
        } else {
          setWorkflow(resp.data.getWorkflow);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const staffName = (() => {
    if (!workflow?.staffId) return "—";
    const s = staffs.find((st) => st.id === workflow.staffId);
    return s ? `${s.familyName} ${s.givenName}` : workflow.staffId;
  })();

  const applicationDate =
    formatDateSlash(workflow?.overTimeDetails?.date) ||
    formatDateSlash(isoDateFromTimestamp(workflow?.createdAt));

  const categoryLabel = workflow?.category
    ? CATEGORY_LABELS[workflow.category] || workflow.category
    : "-";

  const approvalSteps = useMemo<WorkflowApprovalStepView[]>(
    () =>
      buildWorkflowApprovalTimeline({
        workflow,
        staffs,
        applicantName: staffName,
        applicationDate,
      }),
    [workflow, staffs, staffName, applicationDate]
  );

  const notifySuccess = useCallback(
    (message: string) => dispatch(setSnackbarSuccess(message)),
    [dispatch]
  );
  const notifyError = useCallback(
    (message: string) => dispatch(setSnackbarError(message)),
    [dispatch]
  );
  const handleWorkflowChange = useCallback(
    (nextWorkflow: NonNullable<GetWorkflowQuery["getWorkflow"]>) => {
      setWorkflow(nextWorkflow);
    },
    []
  );

  const {
    currentStaff,
    messages,
    expandedMessages,
    toggleExpanded,
    input,
    setInput,
    sending,
    formatSender,
    sendMessage,
  } = useWorkflowCommentThread({
    workflow,
    staffs,
    cognitoUser,
    updateWorkflow,
    onWorkflowChange: handleWorkflowChange,
    notifySuccess,
    notifyError,
  });

  const permissions = useMemo(
    () => deriveWorkflowDetailPermissions(workflow),
    [workflow]
  );

  const handleWithdraw = async () => {
    if (!workflow?.id) return;
    // disallow withdraw after approval or rejection
    if (permissions.isFinalized) {
      dispatch(
        setSnackbarError("承認済みまたは却下済みの申請は取り下げできません")
      );
      return;
    }
    if (!window.confirm("本当に取り下げますか？")) return;
    try {
      const statusInput: UpdateWorkflowInput = {
        id: workflow.id,
        status: WorkflowStatus.CANCELLED,
      };
      const afterStatus = await updateWorkflow(statusInput);
      setWorkflow(afterStatus as NonNullable<GetWorkflowQuery["getWorkflow"]>);

      const existing = (afterStatus.comments || [])
        .filter((c): c is WorkflowComment => Boolean(c))
        .map((c) => ({
          id: c.id,
          staffId: c.staffId,
          text: c.text,
          createdAt: c.createdAt,
        }));
      const sysComment: WorkflowCommentInput = {
        id: `c-${Date.now()}`,
        staffId: "system",
        text: "申請が取り下げされました",
        createdAt: new Date().toISOString(),
      };
      const commentsInput = [...existing, sysComment];
      const commentUpdate: UpdateWorkflowInput = {
        id: workflow.id,
        comments: commentsInput,
      };
      const afterComments = await updateWorkflow(commentUpdate);
      setWorkflow(
        afterComments as NonNullable<GetWorkflowQuery["getWorkflow"]>
      );
      dispatch(setSnackbarSuccess("取り下げしました"));
      setTimeout(() => navigate(-1), 1000);
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      dispatch(setSnackbarError(msg));
    }
  };

  return (
    <Page
      title="申請内容"
      breadcrumbs={[
        { label: "TOP", href: "/" },
        { label: "ワークフロー", href: "/workflow" },
      ]}
      maxWidth="lg"
    >
      <Paper sx={{ p: 3 }}>
        <WorkflowDetailActions
          onBack={() => navigate(-1)}
          onWithdraw={handleWithdraw}
          onEdit={() => navigate(`/workflow/${id}/edit`)}
          withdrawDisabled={permissions.withdrawDisabled}
          withdrawTooltip={permissions.withdrawTooltip}
          editDisabled={permissions.editDisabled}
          editTooltip={permissions.editTooltip}
        />

        {loading && <Typography>読み込み中...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <Stack spacing={3}>
                <WorkflowMetadataPanel
                  workflowId={workflow?.id}
                  fallbackId={id}
                  category={workflow?.category ?? null}
                  categoryLabel={categoryLabel}
                  staffName={staffName}
                  applicationDate={applicationDate}
                  status={workflow?.status ?? null}
                  overTimeDetails={workflow?.overTimeDetails ?? null}
                  approvalSteps={approvalSteps}
                />
                <WorkflowApplicationDetails
                  category={workflow?.category ?? null}
                  categoryLabel={categoryLabel}
                  overTimeDetails={workflow?.overTimeDetails ?? null}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} sm={5}>
              <WorkflowCommentThread
                messages={messages}
                staffs={staffs}
                currentStaff={currentStaff}
                expandedMessages={expandedMessages}
                onToggle={toggleExpanded}
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                sending={sending}
                formatSender={formatSender}
              />
            </Grid>
          </Grid>
        )}
      </Paper>
    </Page>
  );
}
