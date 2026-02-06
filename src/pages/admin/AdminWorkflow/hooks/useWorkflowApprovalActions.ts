import createOperationLogData from "@entities/operation-log/model/createOperationLogData";
import {
  ApprovalStatus,
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowCategory,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import dayjs from "dayjs";

import { createLogger } from "@/shared/lib/logger";

import {
  buildApprovalStepInputs,
  createSystemComment,
  mapCommentsToInputs,
  resolvePendingApprovalStepIndex,
} from "../services/approvalWorkflowHelpers";
import {
  AttendanceQueryTrigger,
  CreateAttendanceTrigger,
  processClockCorrectionApprovalAttendance,
  processPaidLeaveApprovalAttendance,
  StaffLike,
  UpdateAttendanceTrigger,
  WorkflowApprovalUserError,
} from "../services/workflowApprovalAttendanceService";

const logger = createLogger("useWorkflowApprovalActions");

type WorkflowData = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type CognitoUserLike = {
  id?: string | null;
};

type UseWorkflowApprovalActionsArgs = {
  workflow: WorkflowData | null;
  cognitoUser?: CognitoUserLike | null;
  staffs: StaffLike[];
  updateWorkflow: (input: UpdateWorkflowInput) => Promise<WorkflowData>;
  setWorkflow: (workflow: WorkflowData) => void;
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  getStartTime: () => dayjs.Dayjs;
  getEndTime: () => dayjs.Dayjs;
  getLunchRestStartTime: () => dayjs.Dayjs;
  getLunchRestEndTime: () => dayjs.Dayjs;
  getAttendanceByStaffAndDate: AttendanceQueryTrigger;
  createAttendance: CreateAttendanceTrigger;
  updateAttendance: UpdateAttendanceTrigger;
};

export const useWorkflowApprovalActions = ({
  workflow,
  cognitoUser,
  staffs,
  updateWorkflow,
  setWorkflow,
  notifySuccess,
  notifyError,
  getStartTime,
  getEndTime,
  getLunchRestStartTime,
  getLunchRestEndTime,
  getAttendanceByStaffAndDate,
  createAttendance,
  updateAttendance,
}: UseWorkflowApprovalActionsArgs) => {
  const resolveCurrentStaff = () =>
    cognitoUser?.id
      ? staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)
      : undefined;

  const handleApprove = async () => {
    if (!workflow?.id) return;
    if (workflow.status === WorkflowStatus.CANCELLED) {
      notifyError("キャンセル済みの申請には操作できません");
      return;
    }
    if (!window.confirm("この申請を承認しますか？")) return;

    const currentStaffLocal = resolveCurrentStaff();
    if (!currentStaffLocal?.id) {
      notifyError("承認を実行するユーザー情報が取得できませんでした。");
      return;
    }

    try {
      const steps = buildApprovalStepInputs(workflow);
      const idxToUpdate = resolvePendingApprovalStepIndex(
        steps,
        workflow.nextApprovalStepIndex
      );

      if (idxToUpdate < 0) {
        notifyError("承認可能なステップが見つかりませんでした。");
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

      const inputForUpdate: UpdateWorkflowInput = {
        id: workflow.id,
        approvalSteps: steps,
        approvedStaffIds: approved,
        status: isFinal ? WorkflowStatus.APPROVED : workflow.status,
        finalDecisionTimestamp: isFinal
          ? new Date().toISOString()
          : workflow.finalDecisionTimestamp,
        nextApprovalStepIndex: isFinal
          ? undefined
          : resolvePendingApprovalStepIndex(steps, undefined),
        comments: [
          ...mapCommentsToInputs(workflow.comments),
          createSystemComment("申請を承認しました"),
        ],
      };

      const updated = await updateWorkflow(inputForUpdate);
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
            notifySuccess("有給休暇申請を承認し、勤怠データを更新しました");
          } else if (result.reason === "missing_period") {
            notifySuccess("有給申請を承認しました（勤怠情報の更新はスキップ）");
            return;
          } else {
            notifySuccess(
              "有給申請を承認しました（日付が不正なため勤怠更新をスキップ）"
            );
            return;
          }
        } catch (paidLeaveError) {
          const message =
            paidLeaveError instanceof Error
              ? paidLeaveError.message
              : "有給勤怠の処理に失敗しました";
          logger.error("Paid leave attendance processing failed:", message);
          notifySuccess("有給申請を承認しました（勤怠データの処理に失敗）");
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
            notifySuccess("打刻修正を承認し、勤怠データを更新しました");
          } else {
            notifySuccess("打刻修正を承認し、勤怠データを作成しました");
          }
        } catch (attendanceError) {
          if (attendanceError instanceof WorkflowApprovalUserError) {
            notifyError(attendanceError.message);
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

          notifySuccess("打刻修正を承認しました（勤怠データの処理に失敗）");
        }
      }

      notifySuccess("承認しました");
      try {
        await createOperationLogData({
          staffId: currentStaffLocal.id,
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
      notifyError(message);
    }
  };

  const handleReject = async () => {
    if (!workflow?.id) return;
    if (workflow.status === WorkflowStatus.CANCELLED) {
      notifyError("キャンセル済みの申請には操作できません");
      return;
    }
    if (!window.confirm("この申請を却下しますか？")) return;

    const currentStaffLocal = resolveCurrentStaff();
    if (!currentStaffLocal?.id) {
      notifyError("却下を実行するユーザー情報が取得できませんでした。");
      return;
    }

    try {
      const steps = buildApprovalStepInputs(workflow);
      const idxToUpdate = resolvePendingApprovalStepIndex(
        steps,
        workflow.nextApprovalStepIndex
      );

      if (idxToUpdate < 0) {
        notifyError("却下可能なステップが見つかりませんでした。");
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

      const updated = await updateWorkflow(inputForUpdate);
      setWorkflow(updated);
      notifySuccess("却下しました");

      try {
        await createOperationLogData({
          staffId: currentStaffLocal.id,
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
      notifyError(message);
    }
  };

  return { handleApprove, handleReject };
};
