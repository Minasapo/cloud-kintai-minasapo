import { useSession } from "@app/providers/session/useSession";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import type { WorkflowDetailLoaderData } from "@entities/workflow/model/loader";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import useWorkflowCommentThread from "@features/workflow/comment-thread/model/useWorkflowCommentThread";
import { useWorkflowLoaderWorkflow } from "@features/workflow/hooks/useWorkflowLoaderWorkflow";
import { useAppNotification } from "@shared/lib/useAppNotification";
import ConfirmDialog from "@shared/ui/feedback/ConfirmDialog";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";

import { useWorkflowDetailMeta } from "./useWorkflowDetailMeta";
import { useWorkflowWithdraw } from "./useWorkflowWithdraw";
import { WorkflowDetailContext } from "./WorkflowDetailContext";

export function WorkflowDetailProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cognitoUser, isAuthenticated } = useSession();
  const { staffs } = useStaffs({ isAuthenticated });
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const { workflow: initialWorkflow } =
    useLoaderData() as WorkflowDetailLoaderData;
  const { notify } = useAppNotification();
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);

  const currentStaffId = useMemo(() => {
    if (!cognitoUser?.id) return null;
    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)?.id ?? null
    );
  }, [cognitoUser, staffs]);

  const handleNewCommentNotification = useCallback(() => {
    notify({
      title: "新着コメントがあります",
      description: "申請内容に新しいコメントが投稿されました",
      tone: "info",
      dedupeKey: `workflow-comment-${id ?? "unknown"}`,
    });
  }, [id, notify]);

  const { workflow, setWorkflow } = useWorkflowLoaderWorkflow(initialWorkflow, {
    currentStaffId,
    onNewComment: handleNewCommentNotification,
  });

  const {
    staffName,
    applicationDate,
    categoryLabel,
    approvalSteps,
    permissions,
  } = useWorkflowDetailMeta({ workflow, staffs });

  const notifySuccess = useCallback(
    (message: string) => notify({ title: message, tone: "success" }),
    [notify],
  );
  const notifyError = useCallback(
    (message: string) =>
      notify({
        title: "エラー",
        description: message,
        tone: "error",
      }),
    [notify],
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
    onWorkflowChange: setWorkflow,
    notifySuccess,
    notifyError,
  });

  const { executeWithdraw } = useWorkflowWithdraw({
    workflow,
    updateWorkflow,
    setWorkflow,
    notify,
    navigate,
  });

  const handleOpenWithdrawConfirm = useCallback(() => {
    setWithdrawConfirmOpen(true);
  }, []);

  const handleCloseWithdrawConfirm = useCallback(() => {
    setWithdrawConfirmOpen(false);
  }, []);

  const handleConfirmWithdraw = useCallback(async () => {
    setWithdrawConfirmOpen(false);
    await executeWithdraw();
  }, [executeWithdraw]);

  return (
    <WorkflowDetailContext.Provider
      value={{
        data: {
          workflow,
          id,
          staffs,
          staffName,
          applicationDate,
          categoryLabel,
          approvalSteps,
          currentStaff,
          messages,
        },
        ui: {
          expandedMessages,
          input,
          sending,
        },
        actions: {
          permissions,
          onBack: () => navigate("/workflow"),
          onWithdraw: handleOpenWithdrawConfirm,
          onEdit: () => navigate(`/workflow/${id}/edit`),
          toggleExpanded,
          setInput,
          formatSender,
          sendMessage,
        },
        workflow,
        id,
        staffs,
        staffName,
        applicationDate,
        categoryLabel,
        approvalSteps,
        permissions,
        onBack: () => navigate("/workflow"),
        onWithdraw: handleOpenWithdrawConfirm,
        onEdit: () => navigate(`/workflow/${id}/edit`),
        currentStaff,
        messages,
        expandedMessages,
        toggleExpanded,
        input,
        setInput,
        sending,
        formatSender,
        sendMessage,
      }}
    >
      {children}
      <ConfirmDialog
        open={withdrawConfirmOpen}
        title="取り下げ確認"
        message="本当に取り下げますか？"
        confirmLabel="取り下げる"
        onConfirm={() => {
          void handleConfirmWithdraw();
        }}
        onCancel={handleCloseWithdrawConfirm}
      />
    </WorkflowDetailContext.Provider>
  );
}
