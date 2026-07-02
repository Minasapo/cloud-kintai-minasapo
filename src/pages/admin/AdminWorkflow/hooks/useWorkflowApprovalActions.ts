import { logOperationEvent } from "@entities/operation-log/model/canonicalOperationLog";
import {
  ApprovalStatus,
  GetWorkflowQuery,
  UpdateWorkflowInput,
  WorkflowCategory,
  WorkflowStatus,
} from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import dayjs from "dayjs";

import {
  buildApprovalStepInputs,
  canApproveWorkflow,
  canRejectWorkflow,
  createSystemComment,
  mapCommentsToInputs,
  resolvePendingApprovalStepIndex,
} from "../services/approvalWorkflowHelpers";
import {
  AttendanceQueryTrigger,
  CreateAttendanceTrigger,
  processClockCorrectionApprovalAttendance,
  processCompensatoryLeaveApprovalAttendance,
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
  notifyInfo?: (title: string, description?: string) => void;
  getStartTime: () => dayjs.Dayjs;
  getEndTime: () => dayjs.Dayjs;
  getLunchRestStartTime: () => dayjs.Dayjs;
  getLunchRestEndTime: () => dayjs.Dayjs;
  getAttendanceByStaffAndDate: AttendanceQueryTrigger;
  createAttendance: CreateAttendanceTrigger;
  updateAttendance: UpdateAttendanceTrigger;
};

type ApproveArgs = Omit<
  UseWorkflowApprovalActionsArgs,
  "workflow" | "cognitoUser" | "notifyInfo"
> & {
  workflow: WorkflowData;
  currentStaff: StaffLike & { id: string };
  notifyInfo: (title: string, description?: string) => void;
};

type RejectArgs = Pick<
  UseWorkflowApprovalActionsArgs,
  "updateWorkflow" | "setWorkflow" | "notifySuccess" | "notifyError"
> & {
  workflow: WorkflowData;
  currentStaff: StaffLike & { id: string };
  notifyInfo: (title: string, description?: string) => void;
};

function resolveCurrentStaff(
  cognitoUser: CognitoUserLike | null | undefined,
  staffs: StaffLike[],
): StaffLike | undefined {
  if (!cognitoUser?.id) return undefined;
  return staffs.find((staff) => staff.cognitoUserId === cognitoUser.id);
}

async function performApprove({
  workflow,
  currentStaff,
  staffs,
  updateWorkflow,
  setWorkflow,
  notifySuccess,
  notifyError,
  notifyInfo,
  getStartTime,
  getEndTime,
  getLunchRestStartTime,
  getLunchRestEndTime,
  getAttendanceByStaffAndDate,
  createAttendance,
  updateAttendance,
}: ApproveArgs): Promise<boolean> {
  try {
    const steps = buildApprovalStepInputs(workflow);
    const idxToUpdate = resolvePendingApprovalStepIndex(
      steps,
      workflow.nextApprovalStepIndex,
    );

    if (idxToUpdate < 0) {
      notifyError("承認可能なステップが見つかりませんでした。");
      return false;
    }

    steps[idxToUpdate] = {
      ...steps[idxToUpdate],
      decisionStatus: ApprovalStatus.APPROVED,
      decisionTimestamp: new Date().toISOString(),
      approverComment: null,
    };

    const approved = Array.from(
      new Set([...(workflow.approvedStaffIds || []), currentStaff.id]),
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
          return true;
        } else {
          notifySuccess(
            "有給申請を承認しました（日付が不正なため勤怠更新をスキップ）",
          );
          return true;
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

    if (isFinal && (updated.category as string) === "COMPENSATORY_LEAVE") {
      try {
        const result = await processCompensatoryLeaveApprovalAttendance({
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

        if (result.kind === "skipped") {
          notifySuccess("振替休暇申請を承認しました（勤怠情報の更新はスキップ）");
        } else {
          notifySuccess("振替休暇申請を承認し、勤怠データを更新しました");
        }
      } catch (compensatoryError) {
        if (compensatoryError instanceof WorkflowApprovalUserError) {
          notifyError(compensatoryError.message);
          return false;
        }

        logger.error(
          "Compensatory leave attendance processing failed:",
          compensatoryError,
        );
        notifySuccess("振替休暇申請を承認しました（勤怠データの処理に失敗）");
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
          return false;
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
    const approverName = currentStaff
      ? `${currentStaff.familyName} ${currentStaff.givenName}`
      : undefined;
    notifyInfo(
      "申請が承認されました",
      approverName
        ? `${approverName} さんが申請を承認しました`
        : "申請が承認されました",
    );

    await logOperationEvent({
      action: "workflow.approve",
      resource: "workflow",
      resourceId: updated.id,
      targetStaffId: updated.staffId ?? undefined,
      before: workflow,
      after: updated,
      details: {
        workflowId: updated.id,
        category: updated.category ?? null,
        applicantStaffId: updated.staffId ?? null,
        result: "approved",
      },
    });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Workflow approval failed:", message);
    notifyError(message);
    return false;
  }
}

async function performReject({
  workflow,
  currentStaff,
  updateWorkflow,
  setWorkflow,
  notifySuccess,
  notifyError,
  notifyInfo,
}: RejectArgs): Promise<boolean> {
  try {
    const steps = buildApprovalStepInputs(workflow);

    // 承認済みからの差し戻し
    if (workflow.status === WorkflowStatus.APPROVED) {
      const inputForRevert: UpdateWorkflowInput = {
        id: workflow.id,
        approvalSteps: steps,
        status: WorkflowStatus.REJECTED,
        finalDecisionTimestamp: new Date().toISOString(),
        nextApprovalStepIndex: null,
        comments: [
          ...mapCommentsToInputs(workflow.comments),
          createSystemComment("承認済みの申請を差し戻しました"),
        ],
      };

      const reverted = await updateWorkflow(inputForRevert);
      setWorkflow(reverted);
      notifySuccess("差し戻しました");
      const approverName = currentStaff
        ? `${currentStaff.familyName} ${currentStaff.givenName}`
        : undefined;
      notifyInfo(
        "申請が差し戻されました",
        approverName
          ? `${approverName} さんが申請を差し戻しました`
          : "申請が差し戻されました",
      );

      await logOperationEvent({
        action: "workflow.revert",
        resource: "workflow",
        resourceId: reverted.id,
        targetStaffId: reverted.staffId ?? undefined,
        before: workflow,
        after: reverted,
        details: {
          workflowId: reverted.id,
          category: reverted.category ?? null,
          applicantStaffId: reverted.staffId ?? null,
          result: "reverted",
        },
      });
      return true;
    }

    const idxToUpdate = resolvePendingApprovalStepIndex(
      steps,
      workflow.nextApprovalStepIndex,
    );

    if (idxToUpdate < 0) {
      notifyError("却下可能なステップが見つかりませんでした。");
      return false;
    }

    steps[idxToUpdate] = {
      ...steps[idxToUpdate],
      decisionStatus: ApprovalStatus.REJECTED,
      decisionTimestamp: new Date().toISOString(),
      approverComment: null,
    };

    const rejected = Array.from(
      new Set([...(workflow.rejectedStaffIds || []), currentStaff.id]),
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
    const approverName = currentStaff
      ? `${currentStaff.familyName} ${currentStaff.givenName}`
      : undefined;
    notifyInfo(
      "申請が却下されました",
      approverName
        ? `${approverName} さんが申請を却下しました`
        : "申請が却下されました",
    );

    await logOperationEvent({
      action: "workflow.reject",
      resource: "workflow",
      resourceId: updated.id,
      targetStaffId: updated.staffId ?? undefined,
      before: workflow,
      after: updated,
      details: {
        workflowId: updated.id,
        category: updated.category ?? null,
        applicantStaffId: updated.staffId ?? null,
        result: "rejected",
      },
    });
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("Workflow rejection failed:", message);
    notifyError(message);
    return false;
  }
}

export const useWorkflowApprovalActions = ({
  workflow,
  cognitoUser,
  staffs,
  updateWorkflow,
  setWorkflow,
  notifySuccess,
  notifyError,
  notifyInfo: notifyInfoProp,
  getStartTime,
  getEndTime,
  getLunchRestStartTime,
  getLunchRestEndTime,
  getAttendanceByStaffAndDate,
  createAttendance,
  updateAttendance,
}: UseWorkflowApprovalActionsArgs) => {
  const notifyInfo = notifyInfoProp ?? (() => undefined);

  const handleApprove = async (): Promise<boolean> => {
    if (!workflow?.id) return false;
    if (workflow.status === WorkflowStatus.CANCELLED) {
      notifyError("キャンセル済みの申請には操作できません");
      return false;
    }
    if (!canApproveWorkflow(workflow)) {
      notifyError("承認可能なステップが見つかりませんでした。");
      return false;
    }
    const currentStaffLocal = resolveCurrentStaff(cognitoUser, staffs);
    if (!currentStaffLocal?.id) {
      notifyError("承認を実行するユーザー情報が取得できませんでした。");
      return false;
    }
    return performApprove({
      workflow,
      currentStaff: currentStaffLocal,
      staffs,
      updateWorkflow,
      setWorkflow,
      notifySuccess,
      notifyError,
      notifyInfo,
      getStartTime,
      getEndTime,
      getLunchRestStartTime,
      getLunchRestEndTime,
      getAttendanceByStaffAndDate,
      createAttendance,
      updateAttendance,
    });
  };

  const handleReject = async (): Promise<boolean> => {
    if (!workflow?.id) return false;
    if (workflow.status === WorkflowStatus.CANCELLED) {
      notifyError("キャンセル済みの申請には操作できません");
      return false;
    }
    if (!canRejectWorkflow(workflow)) {
      notifyError("却下可能なステップが見つかりませんでした。");
      return false;
    }
    const currentStaffLocal = resolveCurrentStaff(cognitoUser, staffs);
    if (!currentStaffLocal?.id) {
      notifyError("却下を実行するユーザー情報が取得できませんでした。");
      return false;
    }
    return performReject({
      workflow,
      currentStaff: currentStaffLocal,
      updateWorkflow,
      setWorkflow,
      notifySuccess,
      notifyError,
      notifyInfo,
    });
  };

  return { handleApprove, handleReject };
};
