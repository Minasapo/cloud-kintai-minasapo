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
import { designTokenVar } from "@/shared/designSystem";
import { createLogger } from "@/shared/lib/logger";
import { formatDateSlash, isoDateFromTimestamp } from "@/shared/lib/time";
import { PageSection } from "@/shared/ui/layout";

const SECTION_GAP = designTokenVar("spacing.xl", "24px");
const PANEL_GAP = designTokenVar("spacing.lg", "16px");
const PANEL_BACKGROUND = designTokenVar("color.surface.primary", "#FFFFFF");
const PANEL_BORDER = designTokenVar("color.border.subtle", "#D7E0DB");
const PANEL_RADIUS = designTokenVar("radius.lg", "12px");
const PANEL_PADDING = designTokenVar("spacing.xl", "24px");
const ERROR_COLOR = designTokenVar("color.feedback.danger.base", "#D7443E");
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
      setTimeout(() => navigate(-1), 1000);
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
      breadcrumbs={[
        { label: "TOP", href: "/" },
        { label: "ワークフロー", href: "/workflow" },
      ]}
      maxWidth="lg"
    >
      <PageSection
        variant="plain"
        layoutVariant="detail"
        sx={{ gap: SECTION_GAP }}
      >
        <section
          className="overflow-hidden"
          style={{
            backgroundColor: PANEL_BACKGROUND,
            border: `1px solid ${PANEL_BORDER}`,
            borderRadius: PANEL_RADIUS,
            padding: PANEL_PADDING,
          }}
        >
          <WorkflowDetailActions
            onBack={() => navigate(-1)}
            onWithdraw={handleWithdraw}
            onEdit={() => navigate(`/workflow/${id}/edit`)}
            withdrawDisabled={permissions.withdrawDisabled}
            withdrawTooltip={permissions.withdrawTooltip}
            editDisabled={permissions.editDisabled}
            editTooltip={permissions.editTooltip}
          />

          {!workflow ? (
            <p style={{ color: ERROR_COLOR }}>
              ワークフローの読み込みに失敗しました。
            </p>
          ) : (
            <div
              className="mt-4 grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(22rem,0.9fr)]"
              style={{ gap: PANEL_GAP }}
            >
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

              <div className="min-w-0">
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
        </section>
      </PageSection>
    </Page>
  );
}
