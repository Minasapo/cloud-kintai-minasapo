import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import Page from "@shared/ui/page/Page";
import { useCallback, useContext, useMemo } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { getWorkflowCategoryLabel } from "@/entities/workflow/lib/workflowLabels";
import type { WorkflowDetailLoaderData } from "@/entities/workflow/model/loader";
import { buildWorkflowApprovalTimeline } from "@/features/workflow/approval-flow/model/workflowApprovalTimeline";
import type { WorkflowApprovalStepView } from "@/features/workflow/approval-flow/types";
import useWorkflowCommentThread from "@/features/workflow/comment-thread/model/useWorkflowCommentThread";
import WorkflowCommentThread from "@/features/workflow/comment-thread/ui/WorkflowCommentThread";
import { useWorkflowWithdraw } from "@/features/workflow/detail-panel/model/useWorkflowWithdraw";
import { deriveWorkflowDetailPermissions } from "@/features/workflow/detail-panel/model/workflowDetailPermissions";
import WorkflowDetailHeader from "@/features/workflow/detail-panel/ui/WorkflowDetailHeader";
import WorkflowMetadataPanel from "@/features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import {
  useWorkflowLoaderWorkflow,
} from "@/features/workflow/hooks/useWorkflowLoaderWorkflow";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { formatDateSlash, isoDateFromTimestamp } from "@/shared/lib/time";
import { PageSection } from "@/shared/ui/layout";

export default function WorkflowDetail() {
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

  const staffName = useMemo(() => {
    if (!workflow?.staffId) return "—";
    const s = staffs.find((st) => st.id === workflow.staffId);
    return s ? `${s.familyName} ${s.givenName}` : workflow.staffId;
  }, [workflow, staffs]);

  const applicationDate = formatDateSlash(
    isoDateFromTimestamp(workflow?.createdAt),
  );

  const categoryLabel = getWorkflowCategoryLabel(workflow);

  const approvalSteps = useMemo<WorkflowApprovalStepView[]>(
    () =>
      buildWorkflowApprovalTimeline({
        workflow,
        staffs,
        applicantName: staffName,
        applicationDate,
      }),
    [workflow, staffs, staffName, applicationDate],
  );

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

  const permissions = useMemo(
    () => deriveWorkflowDetailPermissions(workflow),
    [workflow],
  );

  const { handleWithdraw } = useWorkflowWithdraw({
    workflow,
    updateWorkflow,
    setWorkflow,
    notify,
    navigate,
  });

  return (
    <Page
      title="申請内容"
      maxWidth={false}
      showDefaultHeader={false}
    >
      <PageSection
        variant="plain"
        layoutVariant="detail"
        sx={{ gap: 0 }}
      >
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-4 px-6 pb-10 pt-2">
          <WorkflowDetailHeader
            onBack={() => navigate("/workflow")}
            onWithdraw={handleWithdraw}
            onEdit={() => navigate(`/workflow/${id}/edit`)}
            withdrawDisabled={permissions.withdrawDisabled}
            withdrawTooltip={permissions.withdrawTooltip}
            editDisabled={permissions.editDisabled}
            editTooltip={permissions.editTooltip}
          />

          {!workflow ? (
            <div className="rounded-[20px] border border-rose-500/15 bg-rose-50/90 px-4 py-3 text-sm font-medium text-rose-900">
              ワークフローの読み込みに失敗しました。
            </div>
          ) : (
            <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.9fr)]">
              <div className="min-w-0">
                <WorkflowMetadataPanel
                  workflowId={workflow.id}
                  fallbackId={id}
                  category={workflow.category ?? null}
                  categoryLabel={categoryLabel}
                  staffName={staffName}
                  applicationDate={applicationDate}
                  status={workflow.status ?? null}
                  overTimeDetails={workflow.overTimeDetails ?? null}
                  customWorkflowTitle={workflow.customWorkflowTitle ?? null}
                  customWorkflowContent={workflow.customWorkflowContent ?? null}
                  approvalSteps={approvalSteps}
                />
              </div>

              <div className="min-w-0 rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_24px_48px_-36px_rgba(15,23,42,0.35)] md:p-5">
                <WorkflowCommentThread
                  key={workflow?.id ?? "workflow-comment-thread"}
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
              </div>
            </div>
          )}
        </div>
      </PageSection>
    </Page>
  );
}
