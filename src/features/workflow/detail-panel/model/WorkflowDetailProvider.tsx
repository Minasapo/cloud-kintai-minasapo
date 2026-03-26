import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { type ReactNode,useCallback, useContext, useMemo } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import type { WorkflowDetailLoaderData } from "@/entities/workflow/model/loader";
import useWorkflowCommentThread from "@/features/workflow/comment-thread/model/useWorkflowCommentThread";
import { useWorkflowLoaderWorkflow } from "@/features/workflow/hooks/useWorkflowLoaderWorkflow";
import { useLocalNotification } from "@/hooks/useLocalNotification";

import { useWorkflowDetailMeta } from "./useWorkflowDetailMeta";
import { useWorkflowWithdraw } from "./useWorkflowWithdraw";
import { WorkflowDetailContext } from "./WorkflowDetailContext";

export function WorkflowDetailProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const { workflow: initialWorkflow } =
    useLoaderData() as WorkflowDetailLoaderData;
  const { notify, canNotify } = useLocalNotification();

  const currentStaffId = useMemo(() => {
    if (!cognitoUser?.id) return null;
    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)?.id ?? null
    );
  }, [cognitoUser, staffs]);

  const handleNewCommentNotification = useCallback(() => {
    if (!canNotify) return;
    void notify("新着コメントがあります", {
      body: "申請内容に新しいコメントが投稿されました",
      tag: `workflow-comment-${id ?? "unknown"}`,
      mode: "auto-close",
      priority: "high",
    });
  }, [canNotify, id, notify]);

  const { workflow, setWorkflow } = useWorkflowLoaderWorkflow(initialWorkflow, {
    currentStaffId,
    onNewComment: handleNewCommentNotification,
  });

  const { staffName, applicationDate, categoryLabel, approvalSteps, permissions } =
    useWorkflowDetailMeta({ workflow, staffs });

  const notifySuccess = useCallback(
    (message: string) => void notify(message, { mode: "auto-close" }),
    [notify],
  );
  const notifyError = useCallback(
    (message: string) =>
      void notify("エラー", {
        body: message,
        mode: "await-interaction",
        priority: "high",
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

  const { handleWithdraw } = useWorkflowWithdraw({
    workflow,
    updateWorkflow,
    setWorkflow,
    notify,
    navigate,
  });

  return (
    <WorkflowDetailContext.Provider
      value={{
        workflow,
        id,
        staffs,
        staffName,
        applicationDate,
        categoryLabel,
        approvalSteps,
        permissions,
        onBack: () => navigate("/workflow"),
        onWithdraw: handleWithdraw,
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
    </WorkflowDetailContext.Provider>
  );
}
