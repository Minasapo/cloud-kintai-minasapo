import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import {
  ApprovalStatus,
  ApprovalStep,
  GetWorkflowQuery,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import Page from "@shared/ui/page/Page";
import { useContext, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatchV2 } from "@/app/hooks";
import { AppConfigContext } from "@/context/AppConfigContext";
import { AuthContext } from "@/context/AuthContext";
import {
  useCreateAttendanceMutation,
  useLazyGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@/entities/attendance/api/attendanceApi";
import { getWorkflowCategoryLabel } from "@/entities/workflow/lib/workflowLabels";
import WorkflowMetadataPanel from "@/features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import { createLogger } from "@/shared/lib/logger";
import { setSnackbarError, setSnackbarSuccess } from "@/shared/lib/store/snackbarSlice";
import { formatDateSlash, isoDateFromTimestamp } from "@/shared/lib/time";

import WorkflowCommentSection from "./components/WorkflowCommentSection";
import { useWorkflowApprovalActions } from "./hooks/useWorkflowApprovalActions";
import { useWorkflowDetailData } from "./hooks/useWorkflowDetailData";

const logger = createLogger("AdminWorkflowDetail");

export default function AdminWorkflowDetail() {
  const { id } = useParams() as { id?: string };
  const navigate = useNavigate();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useContext(AppConfigContext);
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const [createAttendance] = useCreateAttendanceMutation();
  const [getAttendanceByStaffAndDate] =
    useLazyGetAttendanceByStaffAndDateQuery();
  const [updateAttendance] = useUpdateAttendanceMutation();

  const { workflow, setWorkflow, loading, error } = useWorkflowDetailData(id);
  const dispatch = useAppDispatchV2();

  const staffName = (() => {
    if (!workflow?.staffId) return "—";
    const s = staffs.find((st) => st.id === workflow.staffId);
    return s ? `${s.familyName} ${s.givenName}` : workflow.staffId;
  })();

  const approverInfo = useMemo(() => {
    if (!workflow?.staffId) return { mode: "any", items: [] as string[] };
    const applicant = staffs.find((s) => s.id === workflow.staffId);
    const mode = applicant?.approverSetting ?? null;
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

  const applicationDate = formatDateSlash(
    isoDateFromTimestamp(workflow?.createdAt)
  );

  const approvalSteps = useMemo(() => {
    const base = [
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
  }, [workflow, staffs, staffName, applicationDate, approverInfo]);

  const { handleApprove, handleReject } = useWorkflowApprovalActions({
    workflow,
    cognitoUser,
    staffs,
    updateWorkflow: (input) =>
      updateWorkflow(input) as Promise<NonNullable<GetWorkflowQuery["getWorkflow"]>>,
    setWorkflow,
    notifySuccess: (message) => dispatch(setSnackbarSuccess(message)),
    notifyError: (message) => dispatch(setSnackbarError(message)),
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getAttendanceByStaffAndDate,
    createAttendance,
    updateAttendance,
  });

  return (
    <Page
      title="申請内容（管理者）"
      breadcrumbs={[
        { label: "TOP", href: "/" },
        { label: "ワークフロー管理", href: "/admin/workflow" },
      ]}
      maxWidth="lg"
    >
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box>
            <Button size="small" sx={{ mr: 1 }} onClick={() => navigate(-1)}>
              一覧に戻る
            </Button>
          </Box>
          <Box>
            <Button
              size="small"
              variant="contained"
              color="success"
              sx={{ mr: 1 }}
              onClick={handleApprove}
              disabled={
                !workflow?.id ||
                workflow?.status === WorkflowStatus.APPROVED ||
                workflow?.status === WorkflowStatus.CANCELLED
              }
            >
              承認
            </Button>

            <Button
              size="small"
              variant="contained"
              color="error"
              sx={{ mr: 1 }}
              onClick={handleReject}
              disabled={
                !workflow?.id ||
                workflow?.status === WorkflowStatus.REJECTED ||
                workflow?.status === WorkflowStatus.CANCELLED
              }
            >
              却下
            </Button>

            {/* 取り下げボタンは管理者画面では不要のため削除 */}
          </Box>
        </Box>

        {loading && <Typography>読み込み中...</Typography>}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={7}>
              <WorkflowMetadataPanel
                workflowId={workflow?.id ?? undefined}
                fallbackId={id}
                category={workflow?.category ?? null}
                categoryLabel={getWorkflowCategoryLabel(workflow)}
                staffName={staffName}
                applicationDate={applicationDate}
                status={workflow?.status ?? null}
                overTimeDetails={workflow?.overTimeDetails ?? null}
                approvalSteps={approvalSteps}
              />
            </Grid>

            <Grid item xs={12} sm={5}>
              <WorkflowCommentSection
                workflow={workflow}
                staffs={staffs}
                cognitoUser={cognitoUser}
                updateWorkflow={(input) =>
                  updateWorkflow(input) as Promise<
                    NonNullable<GetWorkflowQuery["getWorkflow"]>
                  >
                }
                onWorkflowUpdated={setWorkflow}
                onSuccess={(message) => dispatch(setSnackbarSuccess(message))}
                onError={(message) => {
                  logger.error("Failed to send comment:", message);
                  dispatch(setSnackbarError(message));
                }}
              />
            </Grid>
          </Grid>
        )}
      </Paper>
    </Page>
  );
}
