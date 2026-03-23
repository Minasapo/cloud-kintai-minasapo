import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { UpdateWorkflowInput, WorkflowStatus } from "@shared/api/graphql/types";
import Page from "@shared/ui/page/Page";
import { useCallback, useContext, useMemo } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { getWorkflowCategoryLabel } from "@/entities/workflow/lib/workflowLabels";
import type { WorkflowDetailLoaderData } from "@/entities/workflow/model/loader";
import { buildWorkflowApprovalTimeline } from "@/features/workflow/approval-flow/model/workflowApprovalTimeline";
import type { WorkflowApprovalStepView } from "@/features/workflow/approval-flow/types";
import useWorkflowCommentThread from "@/features/workflow/comment-thread/model/useWorkflowCommentThread";
import { buildWorkflowCommentsUpdateInput } from "@/features/workflow/comment-thread/model/workflowCommentBuilder";
import WorkflowCommentThread from "@/features/workflow/comment-thread/ui/WorkflowCommentThread";
import { deriveWorkflowDetailPermissions } from "@/features/workflow/detail-panel/model/workflowDetailPermissions";
import WorkflowDetailActions from "@/features/workflow/detail-panel/ui/WorkflowDetailActions";
import WorkflowMetadataPanel from "@/features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import {
  useWorkflowLoaderWorkflow,
  type WorkflowEntity,
} from "@/features/workflow/hooks/useWorkflowLoaderWorkflow";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { createLogger } from "@/shared/lib/logger";
import { formatDateSlash, isoDateFromTimestamp } from "@/shared/lib/time";
import { PageSection } from "@/shared/ui/layout";

const logger = createLogger("WorkflowDetailPage");

export default function WorkflowDetailPage() {
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

  const staffName = (() => {
    if (!workflow?.staffId) return "—";
    const s = staffs.find((st) => st.id === workflow.staffId);
    return s ? `${s.familyName} ${s.givenName}` : workflow.staffId;
  })();

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
  const handleWorkflowChange = useCallback(
    (nextWorkflow: WorkflowEntity) => {
      setWorkflow(nextWorkflow);
    },
    [setWorkflow],
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
    onWorkflowChange: handleWorkflowChange,
    notifySuccess,
    notifyError,
  });

  const permissions = useMemo(
    () => deriveWorkflowDetailPermissions(workflow),
    [workflow],
  );

  const handleWithdraw = async () => {
    if (!workflow?.id) return;
    if (!window.confirm("本当に取り下げますか？")) return;
    try {
      const statusInput: UpdateWorkflowInput = {
        id: workflow.id,
        status: WorkflowStatus.CANCELLED,
      };
      const afterStatus = await updateWorkflow(statusInput);
      setWorkflow(afterStatus as WorkflowEntity);

      const commentUpdate = buildWorkflowCommentsUpdateInput(
        afterStatus as WorkflowEntity,
        "申請が取り下げされました",
      );
      const afterComments = await updateWorkflow(commentUpdate);
      setWorkflow(afterComments as WorkflowEntity);
      void notify("取り下げしました", { mode: "auto-close" });
      setTimeout(() => navigate("/workflow"), 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow withdrawal failed:", message);
      void notify("エラー", {
        body: message,
        mode: "await-interaction",
        priority: "high",
      });
    }
  };

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
          <div className="rounded-[28px] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(247,252,248,0.98)_0%,rgba(236,253,245,0.92)_58%,rgba(255,255,255,0.98)_100%)] p-4 shadow-[0_28px_60px_-42px_rgba(15,23,42,0.35)] md:p-5">
            <div className="flex flex-col gap-3">
              <WorkflowDetailActions
                onBack={() => navigate("/workflow")}
                onWithdraw={handleWithdraw}
                onEdit={() => navigate(`/workflow/${id}/edit`)}
                withdrawDisabled={permissions.withdrawDisabled}
                withdrawTooltip={permissions.withdrawTooltip}
                editDisabled={permissions.editDisabled}
                editTooltip={permissions.editTooltip}
              />
              <div className="flex flex-col gap-1.5">
                <h1 className="m-0 text-[1.85rem] font-bold leading-[1.15] tracking-[-0.02em] text-slate-950 md:text-[2.2rem]">
                  申請内容
                </h1>
                <p className="max-w-[760px] leading-8 text-slate-500">
                  申請内容の確認、コメントのやり取り、編集や取り下げをこの画面で行えます。
                </p>
              </div>
            </div>
          </div>

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
