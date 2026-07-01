import { AuthContext } from "@app/providers/auth/AuthContext";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import {
  DynamicWorkflowFormProvider,
} from "@features/workflow/application-form/model/DynamicWorkflowFormContext";
import DynamicWorkflowTypeFields from "@features/workflow/application-form/ui/DynamicWorkflowTypeFields";
import { useWorkflowEditLoaderState } from "@features/workflow/hooks/useWorkflowEditLoaderState";
import { WorkflowStatus } from "@shared/api/graphql/types";
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

import { useWorkflowEditActions } from "./useWorkflowEditActions";
import styles from "./WorkflowEdit.module.scss";

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

  const [isSaving, setIsSaving] = useState(false);
  const [selectedAction, setSelectedAction] = useState<EditAction>(
    workflow.status === WorkflowStatus.DRAFT ? "draft" : "submit",
  );
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const { dialog, runWithoutGuard } = usePageLeaveGuard({
    isDirty,
    isBusy: isSaving,
  });
  const { handleSave, handleWithdraw, fieldErrors } = useWorkflowEditActions({
    id,
    workflow,
    category,
    fields,
    existingComments,
    setExistingComments,
    applicant,
    updateWorkflow,
    staffs,
    notify,
    navigate,
    runWithoutGuard,
    setIsSaving,
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
