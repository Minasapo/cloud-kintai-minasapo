import { useAppDispatchV2 } from "@app/hooks";
import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  useCreateAttendanceMutation,
  useLazyGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { GetWorkflowQuery, WorkflowStatus } from "@shared/api/graphql/types";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useContext, useMemo, useRef, useState } from "react";

import { useWorkflowApprovalActions } from "./useWorkflowApprovalActions";
import { useWorkflowDetailData } from "./useWorkflowDetailData";

type WorkflowType = NonNullable<GetWorkflowQuery["getWorkflow"]>;

type UseWorkflowCarouselStateParams = {
  selectedWorkflowId: string;
  filteredWorkflowIds: string[];
  workflowsById: Map<string, WorkflowType>;
  enableApprovalActions: boolean;
};

export function useWorkflowCarouselState({
  selectedWorkflowId,
  filteredWorkflowIds,
  workflowsById,
  enableApprovalActions,
}: UseWorkflowCarouselStateParams) {
  const initialIndex = useMemo(
    () =>
      Math.max(
        filteredWorkflowIds.findIndex((id) => id === selectedWorkflowId),
        0,
      ),
    [filteredWorkflowIds, selectedWorkflowId],
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isCompleted, setIsCompleted] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { authStatus, cognitoUser } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const { getStartTime, getEndTime, getLunchRestStartTime, getLunchRestEndTime } =
    useContext(AppConfigContext);
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const [createAttendance] = useCreateAttendanceMutation();
  const [getAttendanceByStaffAndDate] = useLazyGetAttendanceByStaffAndDateQuery();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const dispatch = useAppDispatchV2();

  const currentWorkflowId = filteredWorkflowIds[currentIndex] ?? null;
  const { workflow: workflowDetail, setWorkflow } = useWorkflowDetailData(
    currentWorkflowId ?? "",
  );
  const currentWorkflow = currentWorkflowId
    ? workflowsById.get(currentWorkflowId)
    : undefined;
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < filteredWorkflowIds.length - 1;
  const { handleApprove, handleReject } = useWorkflowApprovalActions({
    workflow: workflowDetail,
    cognitoUser,
    staffs,
    updateWorkflow: (input) =>
      updateWorkflow(input) as Promise<NonNullable<GetWorkflowQuery["getWorkflow"]>>,
    setWorkflow,
    notifySuccess: (message) => dispatch(pushNotification({ tone: "success", message })),
    notifyError: (message) => dispatch(pushNotification({ tone: "error", message })),
    notifyInfo: (title, description) =>
      dispatch(pushNotification({ tone: "info", message: title, description, autoHideMs: null })),
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getAttendanceByStaffAndDate,
    createAttendance,
    updateAttendance,
  });
  const isApproveDisabled =
    !workflowDetail?.id ||
    workflowDetail.status === WorkflowStatus.APPROVED ||
    workflowDetail.status === WorkflowStatus.CANCELLED;
  const isRejectDisabled =
    !workflowDetail?.id ||
    workflowDetail.status === WorkflowStatus.REJECTED ||
    workflowDetail.status === WorkflowStatus.CANCELLED;

  const handlePrev = () => {
    if (!canGoPrev) return;
    setCurrentIndex((previous) => previous - 1);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setCurrentIndex((previous) => previous + 1);
  };

  const moveToNextStep = () => {
    if (!canGoNext) {
      setIsCompleted(true);
      return;
    }
    handleNext();
  };

  const handleApproveAndNext = async () => {
    if (!enableApprovalActions || isApproveDisabled || isCompleted) return;
    if (!(await handleApprove())) return;
    moveToNextStep();
  };

  const handleRejectAndNext = async () => {
    if (!enableApprovalActions || isRejectDisabled || isCompleted) return;
    if (!(await handleReject())) return;
    moveToNextStep();
  };

  return {
    currentIndex,
    isCompleted,
    dialogRef,
    closeButtonRef,
    currentWorkflowId,
    currentWorkflow,
    canGoPrev,
    canGoNext,
    workflowDetail,
    isApproveDisabled,
    isRejectDisabled,
    handlePrev,
    handleNext,
    handleApproveAndNext,
    handleRejectAndNext,
  };
}
