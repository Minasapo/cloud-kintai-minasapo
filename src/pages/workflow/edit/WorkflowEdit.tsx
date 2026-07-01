import { AuthContext } from "@app/providers/auth/AuthContext";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { fetchWorkflowById } from "@entities/workflow/model/loader";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import {
  DynamicWorkflowFormProvider,
} from "@features/workflow/application-form/model/DynamicWorkflowFormContext";
import {
  buildDynamicUpdateWorkflowInput,
  validateDynamicWorkflowForm,
} from "@features/workflow/application-form/model/dynamicWorkflowFormModel";
import DynamicWorkflowTypeFields from "@features/workflow/application-form/ui/DynamicWorkflowTypeFields";
import { extractExistingWorkflowComments } from "@features/workflow/comment-thread/model/workflowCommentBuilder";
import { useWorkflowEditLoaderState } from "@features/workflow/hooks/useWorkflowEditLoaderState";
import { buildResubmissionApprovalResetInput } from "@features/workflow/lib/workflowResubmission";
import { executeWorkflowWithdraw } from "@features/workflow/lib/workflowWithdraw";
import { sendWorkflowSubmissionNotification } from "@features/workflow/notifications/sendWorkflowSubmissionNotification";
import { WorkflowStatus } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import { useAppNotification } from "@shared/lib/useAppNotification";
import {
  AppBackButton,
  AppSplitButton,
  type AppSplitButtonOption,
} from "@shared/ui/button";
import ConfirmDialog from "@shared/ui/feedback/ConfirmDialog";
import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";
import {
  DashboardInnerSurface,
  PageContent,
  PageSection,
} from "@shared/ui/layout";
import Page from "@shared/ui/page/Page";
import { SectionTitle } from "@shared/ui/typography";
import { useContext, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";

import type { WorkflowEditLoaderData } from "@/router/loaders/workflowEditLoader";

import styles from "./WorkflowEdit.module.scss";

const logger = createLogger("WorkflowEdit");

type EditAction = "draft" | "submit" | "withdraw";

export default function WorkflowEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workflow } = useLoaderData() as WorkflowEditLoaderData;

  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const { staffs } = useStaffs({ isAuthenticated });
  const { notify } = useAppNotification();
  const {
    category,
    applicationDate,
    fields,
    setFieldValue,
    applicant,
    existingComments,
    setExistingComments,
    isDirty,
  } = useWorkflowEditLoaderState(workflow, staffs);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAction, setSelectedAction] = useState<EditAction>(
    workflow.status === WorkflowStatus.DRAFT ? "draft" : "submit",
  );
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const { dialog, runWithoutGuard } = usePageLeaveGuard({
    isDirty,
    isBusy: isSaving,
  });

  const withdrawDisabled = useMemo(() => {
    if (!id) return true;
    return (
      workflow.status === WorkflowStatus.CANCELLED ||
      workflow.status === WorkflowStatus.APPROVED
    );
  }, [id, workflow.status]);

  const splitButtonOptions: AppSplitButtonOption[] = useMemo(
    () => [
      {
        key: "draft",
        label: "下書き",
        title: "下書きとして保存",
      },
      {
        key: "submit",
        label: "申請",
        title: "申請として保存",
      },
      {
        key: "withdraw",
        label: "取り下げ",
        title: withdrawDisabled
          ? "承認済みまたは取り下げ済みの申請は取り下げできません"
          : "申請を取り下げる",
        disabled: withdrawDisabled,
      },
    ],
    [withdrawDisabled],
  );

  const handleSave = (action: Extract<EditAction, "draft" | "submit">) => {
    const state = { categoryLabel: category, fields };
    const validation = validateDynamicWorkflowForm(state);
    setFieldErrors(validation.fieldErrors);
    if (!validation.isValid) return;

    (async () => {
      try {
        setIsSaving(true);
        if (!id) throw new Error("IDが不明です");
        const draftMode = action === "draft";
        let latestWorkflow = workflow;
        let normalizedComments = existingComments;
        if (!draftMode) {
          const latest = await fetchWorkflowById(id);
          latestWorkflow = latest;
          normalizedComments = extractExistingWorkflowComments(latest);
          setExistingComments(normalizedComments);
        }

        const baseInput = buildDynamicUpdateWorkflowInput({
          workflowId: id,
          draftMode,
          state,
          existingComments: normalizedComments,
        });

        const shouldResetApprovalChain =
          !draftMode && latestWorkflow.status === WorkflowStatus.REJECTED;
        if (shouldResetApprovalChain) {
          Object.assign(
            baseInput,
            buildResubmissionApprovalResetInput(latestWorkflow),
          );
        }

        const updatedWorkflow = await updateWorkflow(baseInput);

        if (!draftMode) {
          try {
            const workflowApplicant =
              applicant ||
              staffs.find((s) => s.id === workflow.staffId) ||
              null;
            await sendWorkflowSubmissionNotification({
              staffs,
              applicant: workflowApplicant,
              workflow: updatedWorkflow,
            });
          } catch (mailError) {
            logger.error(
              "Failed to send workflow submission notification:",
              mailError,
            );
            notify({
              title: "メール送信エラー",
              description: "管理者への通知メールの送信に失敗しました。",
              tone: "error",
              dedupeKey: "workflow-mail-error",
            });
          }
        }

        notify({
          title: draftMode ? "下書き保存しました" : "申請しました",
          tone: "success",
        });
        setTimeout(() => {
          runWithoutGuard(() => navigate(`/workflow/${id}`));
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Workflow update failed:", message);
        notify({
          title: "エラー",
          description: message,
          tone: "error",
        });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleWithdraw = async () => {
    if (!id || !workflow?.id) return;
    setWithdrawConfirmOpen(false);

    try {
      setIsSaving(true);
      await executeWorkflowWithdraw({
        workflow,
        updateWorkflow,
      });
      notify({ title: "取り下げしました", tone: "success" });
      setTimeout(() => {
        runWithoutGuard(() => navigate("/workflow"));
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow withdrawal failed:", message);
      notify({
        title: "エラー",
        description: message,
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrimaryAction = () => {
    if (selectedAction === "withdraw") {
      setWithdrawConfirmOpen(true);
      return;
    }
    handleSave(selectedAction);
  };

  return (
    <Page
      title="編集"
      width="full"
      showDefaultHeader={false}
    >
      {dialog}
      <PageContent width="form">
        <PageSection
          component="form"
          layoutVariant="dashboard"
          onSubmit={(event) => {
            event.preventDefault();
            handlePrimaryAction();
          }}
          sx={{ gap: 0 }}
        >
          <div className="mb-4 flex flex-col items-start gap-2">
            <div>
              <AppBackButton
                variant="ghost"
                tone="neutral"
                size="sm"
                sx={{ mb: 0.75, px: 0.5 }}
                onClick={() => navigate(id ? `/workflow/${id}` : "/workflow")}
              >
                申請詳細へ戻る
              </AppBackButton>
              <SectionTitle className="m-0 text-2xl font-bold text-slate-900">
                申請を編集
              </SectionTitle>
              <p className="m-0 text-sm text-slate-500">
                申請詳細を起点に、申請内容を更新します。
              </p>
            </div>
          </div>
          <DashboardInnerSurface>
            <div className={styles.formRows}>
              <div className={styles.formRow}>
                <div className={styles.formLabel}>ID</div>
                <div>
                  <p className={styles.formValue}>{id ?? "—"}</p>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formLabel}>種別</div>
                <div>
                  <p className={styles.formValue}>{category || "（未設定）"}</p>
                </div>
              </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>申請者</div>
              <div>
                <p className={styles.formValue}>
                  {applicant
                    ? `${applicant.familyName} ${applicant.givenName}`
                    : "—"}
                </p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>申請日</div>
              <div>
                <p className={styles.formValue}>{applicationDate}</p>
              </div>
            </div>

            <DynamicWorkflowFormProvider
              value={{
                category,
                disabled: false,
                fields,
                setFieldValue,
                fieldErrors,
              }}
            >
              <DynamicWorkflowTypeFields />
            </DynamicWorkflowFormProvider>

            <div className={styles.formRow}>
              <div className={styles.formActions}>
                <div className={styles.actionsGroup}>
                  <AppSplitButton
                    options={splitButtonOptions}
                    selectedKey={selectedAction}
                    onSelectedKeyChange={(key) => {
                      setSelectedAction(key as EditAction);
                    }}
                    onPrimaryClick={() => {
                      handlePrimaryAction();
                    }}
                    disabled={isSaving}
                    variant="solid"
                    tone={selectedAction === "withdraw" ? "danger" : "primary"}
                    size="sm"
                    className={styles.submitButtonGroup}
                  />
                </div>
              </div>
            </div>
            </div>
          </DashboardInnerSurface>
        </PageSection>
      </PageContent>
      <ConfirmDialog
        open={withdrawConfirmOpen}
        title="取り下げ確認"
        message="本当に取り下げますか？"
        confirmLabel="取り下げる"
        onConfirm={() => {
          void handleWithdraw();
        }}
        onCancel={() => setWithdrawConfirmOpen(false)}
      />
    </Page>
  );
}
