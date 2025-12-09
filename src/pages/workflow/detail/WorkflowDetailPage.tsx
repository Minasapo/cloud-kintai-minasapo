import { GraphQLResult } from "@aws-amplify/api";
import { Grid, Paper, Typography } from "@mui/material";
import { getWorkflow } from "@shared/api/graphql/documents/queries";
import {
  ApprovalStatus,
  ApprovalStep,
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowComment,
  WorkflowCommentInput,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import Page from "@shared/ui/page/Page";
import { API } from "aws-amplify";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatchV2 } from "@/app/hooks";
import { AuthContext } from "@/context/AuthContext";
import type { WorkflowApprovalStepView } from "@/features/workflow/approval-flow/ui/WorkflowApprovalTimeline";
import useWorkflowCommentThread from "@/features/workflow/comment-thread/model/useWorkflowCommentThread";
import WorkflowCommentThread from "@/features/workflow/comment-thread/ui/WorkflowCommentThread";
import WorkflowDetailActions from "@/features/workflow/detail-panel/ui/WorkflowDetailActions";
import WorkflowMetadataPanel from "@/features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import useStaffs from "@/hooks/useStaffs/useStaffs";
import useWorkflows from "@/hooks/useWorkflows/useWorkflows";
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
        const resp = (await API.graphql({
          query: getWorkflow,
          variables: { id },
          authMode: "AMAZON_COGNITO_USER_POOLS",
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

  const approverInfo = useMemo(() => {
    // normalize to three modes: 'single' | 'any' | 'order'
    if (!workflow?.staffId) return { mode: "any", items: [] as string[] };
    const applicant = staffs.find((s) => s.id === workflow.staffId);
    // applicant may carry approver config
    const mode = applicant?.approverSetting ?? null;
    // treat missing or ADMINS as 'any' (管理者全員)
    if (!mode || mode === "ADMINS")
      return { mode: "any", items: ["管理者全員"] };

    if (mode === "SINGLE") {
      const singleId = applicant?.approverSingle;
      if (!singleId) return { mode: "single", items: ["未設定"] };
      const st = staffs.find(
        (s) => s.cognitoUserId === singleId || s.id === singleId
      );
      return {
        mode: "single",
        items: [st ? `${st.familyName} ${st.givenName}` : singleId],
      };
    }

    if (mode === "MULTIPLE") {
      const multiple = applicant?.approverMultiple ?? [];
      if (multiple.length === 0) return { mode: "any", items: ["未設定"] };
      const items = multiple.map((aid) => {
        const st = staffs.find((s) => s.cognitoUserId === aid || s.id === aid);
        return st ? `${st.familyName} ${st.givenName}` : aid || "";
      });
      const multipleMode = applicant?.approverMultipleMode ?? null;
      return { mode: multipleMode === "ORDER" ? "order" : "any", items };
    }

    return { mode: "any", items: ["管理者全員"] };
  }, [staffs, workflow]);

  const applicationDate =
    formatDateSlash(workflow?.overTimeDetails?.date) ||
    formatDateSlash(isoDateFromTimestamp(workflow?.createdAt));

  const categoryLabel = workflow?.category
    ? CATEGORY_LABELS[workflow.category] || workflow.category
    : "-";

  const approvalSteps = useMemo<WorkflowApprovalStepView[]>(() => {
    const base: WorkflowApprovalStepView[] = [
      {
        id: "s0",
        name: staffName,
        role: "申請者",
        state: "",
        date: applicationDate,
        comment: "",
      },
    ];
    if (!workflow) return base;
    // If explicit approvalSteps exist on the workflow, display them with recorded decisions
    if (workflow.approvalSteps && workflow.approvalSteps.length > 0) {
      const steps = (workflow.approvalSteps as ApprovalStep[])
        .slice()
        .sort((a, b) => (a?.stepOrder ?? 0) - (b?.stepOrder ?? 0));
      steps.forEach((st, idx) => {
        const approverId = st.approverStaffId || "";
        const staff = staffs.find((s) => s.id === approverId);
        const name =
          approverId === "ADMINS"
            ? "管理者全員"
            : staff
            ? `${staff.familyName} ${staff.givenName}`
            : approverId || "未設定";
        const state = st.decisionStatus
          ? st.decisionStatus === ApprovalStatus.APPROVED
            ? "承認済み"
            : st.decisionStatus === ApprovalStatus.REJECTED
            ? "却下"
            : st.decisionStatus === ApprovalStatus.SKIPPED
            ? "スキップ"
            : "未承認"
          : "未承認";
        const date = st.decisionTimestamp
          ? new Date(st.decisionTimestamp).toLocaleString()
          : "";
        base.push({
          id: st.id ?? `s${idx + 1}`,
          name,
          role: "承認者",
          state,
          date,
          comment: st.approverComment ?? "",
        });
      });
      return base;
    }

    // Fallback: derive from applicant's current approver settings
    const isApproved = workflow.status === WorkflowStatus.APPROVED;
    if (approverInfo.mode === "any") {
      const hasSpecific =
        approverInfo.items.length > 0 && approverInfo.items[0] !== "管理者全員";
      base.push({
        id: "s1",
        name: hasSpecific ? approverInfo.items.join(" / ") : "管理者全員",
        role: hasSpecific ? "承認者（複数）" : "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }
    if (approverInfo.mode === "single") {
      base.push({
        id: "s1",
        name: approverInfo.items[0] ?? "未設定",
        role: "承認者",
        state: isApproved ? "承認済み" : "未承認",
        date: isApproved ? applicationDate : "",
        comment: "",
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }
    if (approverInfo.mode === "order") {
      approverInfo.items.forEach((it, idx) => {
        base.push({
          id: `s${idx + 1}`,
          name: it,
          role: `承認者`,
          state: isApproved ? "承認済み" : "未承認",
          date: isApproved ? applicationDate : "",
          comment: "",
        });
      });
      if (!isApproved) base[0].date = applicationDate;
      return base;
    }

    return base;
  }, [workflow, staffName, applicationDate, approverInfo]);

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

  // helper flags for edit/withdraw permissions
  const isSubmittedOrLater = useMemo(() => {
    if (!workflow?.status) return false;
    return [
      WorkflowStatus.SUBMITTED,
      WorkflowStatus.PENDING,
      WorkflowStatus.APPROVED,
      WorkflowStatus.REJECTED,
      WorkflowStatus.CANCELLED,
    ].includes(workflow.status as WorkflowStatus);
  }, [workflow]);

  const isFinalized = useMemo(() => {
    if (!workflow?.status) return false;
    return [WorkflowStatus.APPROVED, WorkflowStatus.REJECTED].includes(
      workflow.status as WorkflowStatus
    );
  }, [workflow]);

  const withdrawDisabled =
    !workflow?.id ||
    workflow?.status === WorkflowStatus.CANCELLED ||
    isFinalized;
  const withdrawTooltip =
    workflow?.status === WorkflowStatus.CANCELLED
      ? "キャンセル済みのワークフローは取り下げできません"
      : isFinalized
      ? "承認済みまたは却下済みの申請は取り下げできません"
      : undefined;
  const editDisabled = !workflow?.id || isSubmittedOrLater;
  const editTooltip = isSubmittedOrLater
    ? "提出済み以降の申請は編集できません"
    : undefined;

  const handleWithdraw = async () => {
    if (!workflow?.id) return;
    // disallow withdraw after approval or rejection
    if (
      workflow?.status === WorkflowStatus.APPROVED ||
      workflow?.status === WorkflowStatus.REJECTED
    ) {
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
          withdrawDisabled={withdrawDisabled}
          withdrawTooltip={withdrawTooltip}
          editDisabled={editDisabled}
          editTooltip={editTooltip}
        />

        {loading && <Typography>読み込み中...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
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
