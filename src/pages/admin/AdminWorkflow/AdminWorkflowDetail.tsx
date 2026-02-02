import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import {
  ApprovalStatus,
  ApprovalStep,
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowCategory,
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
import {
  setSnackbarError,
  setSnackbarSuccess,
} from "@/shared/lib/store/snackbarSlice";
import { formatDateSlash, isoDateFromTimestamp } from "@/shared/lib/time";

import WorkflowCommentSection from "./components/WorkflowCommentSection";
import { useWorkflowDetailData } from "./hooks/useWorkflowDetailData";
import {
  buildApprovalStepInputs,
  createSystemComment,
  mapCommentsToInputs,
  resolvePendingApprovalStepIndex,
} from "./services/approvalWorkflowHelpers";
import {
  processClockCorrectionApprovalAttendance,
  processPaidLeaveApprovalAttendance,
  WorkflowApprovalUserError,
} from "./services/workflowApprovalAttendanceService";

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

  const resolveCurrentStaff = () =>
    cognitoUser?.id
      ? staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)
      : undefined;

  const handleApprove = async () => {
    if (!workflow?.id) return;
    if (workflow?.status === WorkflowStatus.CANCELLED) {
      dispatch(setSnackbarError("キャンセル済みの申請には操作できません"));
      return;
    }
    if (!window.confirm("この申請を承認しますか？")) return;

    const currentStaffLocal = resolveCurrentStaff();
    if (!currentStaffLocal?.id) {
      dispatch(
        setSnackbarError("承認を実行するユーザー情報が取得できませんでした。")
      );
      return;
    }

    try {
      const steps = buildApprovalStepInputs(workflow);
      const idxToUpdate = resolvePendingApprovalStepIndex(
        steps,
        workflow.nextApprovalStepIndex
      );

      if (idxToUpdate < 0) {
        dispatch(
          setSnackbarError("承認可能なステップが見つかりませんでした。")
        );
        return;
      }

      steps[idxToUpdate] = {
        ...steps[idxToUpdate],
        decisionStatus: ApprovalStatus.APPROVED,
        decisionTimestamp: new Date().toISOString(),
        approverComment: null,
      };

      const approved = Array.from(
        new Set([...(workflow.approvedStaffIds || []), currentStaffLocal.id])
      );

      const isFinal =
        workflow.submitterApproverMultipleMode === "ANY" ||
        !steps.some((step) => step.decisionStatus === ApprovalStatus.PENDING);

      const updatedStatus = isFinal ? WorkflowStatus.APPROVED : workflow.status;
      const finalDecisionTimestamp = isFinal
        ? new Date().toISOString()
        : workflow.finalDecisionTimestamp;
      const nextIdx = isFinal
        ? null
        : resolvePendingApprovalStepIndex(steps, undefined);

      const inputForUpdate: UpdateWorkflowInput = {
        id: workflow.id,
        approvalSteps: steps,
        approvedStaffIds: approved,
        status: updatedStatus,
        finalDecisionTimestamp,
        nextApprovalStepIndex: nextIdx ?? undefined,
        comments: [
          ...mapCommentsToInputs(workflow.comments),
          createSystemComment("申請を承認しました"),
        ],
      };

      const updated = (await updateWorkflow(inputForUpdate)) as NonNullable<
        GetWorkflowQuery["getWorkflow"]
      >;
      setWorkflow(updated);

      if (isFinal && updated.category === WorkflowCategory.PAID_LEAVE) {
        try {
          const result = await processPaidLeaveApprovalAttendance({
            workflow: updated,
            staffs,
            getStartTime,
            getEndTime,
            getLunchRestStartTime,
            getLunchRestEndTime,
            getAttendanceByStaffAndDate,
            createAttendance,
            updateAttendance,
          });

          if (result.kind === "updated") {
            dispatch(
              setSnackbarSuccess("有給休暇申請を承認し、勤怠データを更新しました")
            );
          } else if (result.reason === "missing_period") {
            dispatch(
              setSnackbarSuccess(
                "有給申請を承認しました（勤怠情報の更新はスキップ）"
              )
            );
            return;
          } else {
            dispatch(
              setSnackbarSuccess(
                "有給申請を承認しました（日付が不正なため勤怠更新をスキップ）"
              )
            );
            return;
          }
        } catch (paidLeaveError) {
          const message =
            paidLeaveError instanceof Error
              ? paidLeaveError.message
              : "有給勤怠の処理に失敗しました";
          logger.error("Paid leave attendance processing failed:", message);
          dispatch(
            setSnackbarSuccess(
              "有給申請を承認しました（勤怠データの処理に失敗）"
            )
          );
        }
      }

      if (isFinal && updated.category === WorkflowCategory.CLOCK_CORRECTION) {
        try {
          const result = await processClockCorrectionApprovalAttendance({
            workflow: updated,
            staffs,
            getAttendanceByStaffAndDate,
            createAttendance,
            updateAttendance,
          });

          if (result.kind === "updated") {
            dispatch(
              setSnackbarSuccess("打刻修正を承認し、勤怠データを更新しました")
            );
          } else {
            dispatch(
              setSnackbarSuccess("打刻修正を承認し、勤怠データを作成しました")
            );
          }
        } catch (attendanceError) {
          if (attendanceError instanceof WorkflowApprovalUserError) {
            dispatch(setSnackbarError(attendanceError.message));
            return;
          }

          if (attendanceError instanceof Error) {
            logger.error("Attendance data processing failed:", {
              message: attendanceError.message,
              stack: attendanceError.stack,
            });
          } else {
            logger.error("Attendance data processing failed:", attendanceError);
          }

          dispatch(
            setSnackbarSuccess(
              "打刻修正を承認しました（勤怠データの処理に失敗）"
            )
          );
        }
      }

      dispatch(setSnackbarSuccess("承認しました"));
      try {
        await createOperationLogData({
          staffId: currentStaffLocal?.id ?? undefined,
          action: "approve_workflow",
          resource: "workflow",
          resourceId: updated.id,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({
            workflowId: updated.id,
            category: updated.category ?? null,
            applicantStaffId: updated.staffId ?? null,
            result: "approved",
          }),
        });
      } catch (err) {
        logger.error("Failed to create operation log for approve:", err);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow approval failed:", message);
      dispatch(setSnackbarError(message));
    }
  };

  const handleReject = async () => {
    if (!workflow?.id) return;
    if (workflow?.status === WorkflowStatus.CANCELLED) {
      dispatch(setSnackbarError("キャンセル済みの申請には操作できません"));
      return;
    }
    if (!window.confirm("この申請を却下しますか？")) return;

    const currentStaffLocal = resolveCurrentStaff();
    if (!currentStaffLocal?.id) {
      dispatch(
        setSnackbarError("却下を実行するユーザー情報が取得できませんでした。")
      );
      return;
    }

    try {
      const steps = buildApprovalStepInputs(workflow);
      const idxToUpdate = resolvePendingApprovalStepIndex(
        steps,
        workflow.nextApprovalStepIndex
      );

      if (idxToUpdate < 0) {
        dispatch(
          setSnackbarError("却下可能なステップが見つかりませんでした。")
        );
        return;
      }

      steps[idxToUpdate] = {
        ...steps[idxToUpdate],
        decisionStatus: ApprovalStatus.REJECTED,
        decisionTimestamp: new Date().toISOString(),
        approverComment: null,
      };

      const rejected = Array.from(
        new Set([...(workflow.rejectedStaffIds || []), currentStaffLocal.id])
      );

      const inputForUpdate: UpdateWorkflowInput = {
        id: workflow.id,
        approvalSteps: steps,
        rejectedStaffIds: rejected,
        status: WorkflowStatus.REJECTED,
        finalDecisionTimestamp: new Date().toISOString(),
        nextApprovalStepIndex: null,
        comments: [
          ...mapCommentsToInputs(workflow.comments),
          createSystemComment("申請を却下しました"),
        ],
      };

      const updated = (await updateWorkflow(inputForUpdate)) as NonNullable<
        GetWorkflowQuery["getWorkflow"]
      >;
      setWorkflow(updated);
      dispatch(setSnackbarSuccess("却下しました"));

      try {
        await createOperationLogData({
          staffId: currentStaffLocal?.id ?? undefined,
          action: "reject_workflow",
          resource: "workflow",
          resourceId: updated.id,
          timestamp: new Date().toISOString(),
          details: JSON.stringify({
            workflowId: updated.id,
            category: updated.category ?? null,
            applicantStaffId: updated.staffId ?? null,
            result: "rejected",
          }),
        });
      } catch (err) {
        logger.error("Failed to create operation log for reject:", err);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow rejection failed:", message);
      dispatch(setSnackbarError(message));
    }
  };

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
