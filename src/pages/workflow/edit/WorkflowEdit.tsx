import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import Page from "@shared/ui/page/Page";
import { type ChangeEvent, type FormEvent, useContext, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import { fetchWorkflowById } from "@/entities/workflow/model/loader";
import { WorkflowFormProvider } from "@/features/workflow/application-form/model/WorkflowFormContext";
import {
  buildUpdateWorkflowInput,
  CLOCK_CORRECTION_CHECK_OUT_LABEL,
  CLOCK_CORRECTION_LABEL,
  validateWorkflowForm,
  type WorkflowFormState,
} from "@/features/workflow/application-form/model/workflowFormModel";
import WorkflowTypeFields from "@/features/workflow/application-form/ui/WorkflowTypeFields";
import { extractExistingWorkflowComments } from "@/features/workflow/comment-thread/model/workflowCommentBuilder";
import { useWorkflowEditLoaderState } from "@/features/workflow/hooks/useWorkflowEditLoaderState";
import { sendWorkflowSubmissionNotification } from "@/features/workflow/notifications/sendWorkflowSubmissionNotification";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { usePageLeaveGuard } from "@/hooks/usePageLeaveGuard";
import type { WorkflowEditLoaderData } from "@/router/loaders/workflowEditLoader";
import { createLogger } from "@/shared/lib/logger";
import {
  DashboardInnerSurface,
  PageContent,
  PageSection,
} from "@/shared/ui/layout";

import styles from "./WorkflowEdit.module.scss";

const logger = createLogger("WorkflowEdit");

export default function WorkflowEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workflow } = useLoaderData() as WorkflowEditLoaderData;

  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const { staffs } = useStaffs({ isAuthenticated });
  const { notify } = useLocalNotification();
  const {
    category,
    setCategory,
    applicationDate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    absenceDate,
    setAbsenceDate,
    absenceReason,
    setAbsenceReason,
    paidReason,
    setPaidReason,
    overtimeDate,
    setOvertimeDate,
    overtimeStart,
    setOvertimeStart,
    overtimeEnd,
    setOvertimeEnd,
    overtimeReason,
    setOvertimeReason,
    customWorkflowTitle,
    setCustomWorkflowTitle,
    customWorkflowContent,
    setCustomWorkflowContent,
    draftMode,
    setDraftMode,
    applicant,
    existingComments,
    setExistingComments,
    isDirty,
  } = useWorkflowEditLoaderState(workflow, staffs);
  const [dateError, setDateError] = useState("");
  const [absenceDateError, setAbsenceDateError] = useState("");
  const [overtimeDateError, setOvertimeDateError] = useState("");
  const [overtimeError, setOvertimeError] = useState("");
  const [customWorkflowTitleError, setCustomWorkflowTitleError] = useState("");
  const [customWorkflowContentError, setCustomWorkflowContentError] =
    useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { dialog, runWithoutGuard } = usePageLeaveGuard({
    isDirty,
    isBusy: isSaving,
  });

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const formState: WorkflowFormState = {
      categoryLabel: category,
      startDate,
      endDate,
      absenceDate,
      paidReason,
      absenceReason,
      overtimeDate,
      overtimeStart,
      overtimeEnd,
      overtimeReason,
      customWorkflowTitle,
      customWorkflowContent,
    };

    const validation = validateWorkflowForm(formState);
    setDateError(validation.errors.dateError ?? "");
    setAbsenceDateError(validation.errors.absenceDateError ?? "");
    setOvertimeDateError(validation.errors.overtimeDateError ?? "");
    setOvertimeError(validation.errors.overtimeError ?? "");
    setCustomWorkflowTitleError(
      validation.errors.customWorkflowTitleError ?? "",
    );
    setCustomWorkflowContentError(
      validation.errors.customWorkflowContentError ?? "",
    );
    if (!validation.isValid) return;

    (async () => {
      try {
        setIsSaving(true);
        if (!id) throw new Error("IDが不明です");
        let normalizedComments = existingComments;
        if (!draftMode) {
          const latest = await fetchWorkflowById(id);
          normalizedComments = extractExistingWorkflowComments(latest);
          setExistingComments(normalizedComments);
        }

        const baseInput = buildUpdateWorkflowInput({
          workflowId: id,
          draftMode,
          state: formState,
          existingComments: normalizedComments,
        });

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
            void notify("メール送信エラー", {
              body: "管理者への通知メールの送信に失敗しました。",
              mode: "await-interaction",
              priority: "normal",
              tag: "workflow-mail-error",
            });
          }
        }

        void notify("保存しました", { mode: "auto-close" });
        setTimeout(() => {
          runWithoutGuard(() => navigate(`/workflow/${id}`));
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error("Workflow update failed:", message);
        void notify("エラー", {
          body: message,
          mode: "await-interaction",
          priority: "high",
        });
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDraftToggle = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDraftMode(checked);
  };

  const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setCategory(v);
    if (v === "有給休暇申請") {
      const today = new Date().toISOString().slice(0, 10);
      setStartDate(today);
      setEndDate(today);
      if (!paidReason) setPaidReason("私用のため");
    }
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
          onSubmit={handleSave}
          sx={{ gap: 0 }}
        >
          <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="m-0 text-2xl font-bold text-slate-900">
                申請を編集
              </h2>
              <p className="m-0 text-sm text-slate-500">
                申請詳細を起点に、申請内容を更新します。
              </p>
            </div>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate(id ? `/workflow/${id}` : "/workflow")}
            >
              申請詳細へ戻る
            </button>
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
                  {id ? (
                    <p className={styles.formValue}>{category || "（未設定）"}</p>
                  ) : (
                    <div className={styles.selectWrap}>
                      <select
                        className={styles.select}
                        value={category}
                        onChange={handleCategoryChange}
                      >
                        <option value="">種別を選択</option>
                        <optgroup label="勤怠">
                          <option value="有給休暇申請">有給休暇申請</option>
                          <option value="欠勤申請">欠勤申請</option>
                          <option value="残業申請">残業申請</option>
                          <option value={CLOCK_CORRECTION_LABEL}>
                            {CLOCK_CORRECTION_LABEL}
                          </option>
                          <option value={CLOCK_CORRECTION_CHECK_OUT_LABEL}>
                            {CLOCK_CORRECTION_CHECK_OUT_LABEL}
                          </option>
                          <option value="その他">その他</option>
                        </optgroup>
                      </select>
                      <span className={styles.selectIcon} aria-hidden="true">
                        ▼
                      </span>
                    </div>
                  )}
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
                {id ? (
                  <p className={styles.formValue}>{applicationDate}</p>
                ) : (
                  <input
                    className={styles.readonlyInput}
                    value={applicationDate}
                    readOnly
                  />
                )}
              </div>
            </div>

            <WorkflowFormProvider
              value={{
                category,
                disabled: false,
                startDate,
                setStartDate,
                endDate,
                setEndDate,
                dateError,
                paidReason,
                setPaidReason,
                absenceDate,
                setAbsenceDate,
                absenceDateError,
                absenceReason,
                setAbsenceReason,
                overtimeDate,
                setOvertimeDate,
                overtimeDateError,
                overtimeStart,
                setOvertimeStart,
                overtimeEnd,
                setOvertimeEnd,
                overtimeError,
                overtimeReason,
                setOvertimeReason,
                customWorkflowTitle,
                setCustomWorkflowTitle,
                customWorkflowContent,
                setCustomWorkflowContent,
                customWorkflowTitleError,
                customWorkflowContentError,
              }}
            >
              <WorkflowTypeFields />
            </WorkflowFormProvider>

            <div className={styles.formRow}>
              <div className={styles.formLabel}>下書き</div>
              <div>
                <label className={styles.toggleWrap}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={draftMode}
                    onChange={handleDraftToggle}
                  />
                  <span className={styles.toggleTrack} />
                  {draftMode ? (
                    <span className={styles.toggleLabelText}>
                      下書きとして保存
                    </span>
                  ) : null}
                </label>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formActions}>
                <div className={styles.actionsGroup}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() =>
                      navigate(id ? `/workflow/${id}` : "/workflow")
                    }
                  >
                    申請詳細へ戻る
                  </button>
                  <button type="submit" className={styles.submitButton}>
                    保存
                  </button>
                </div>
              </div>
            </div>
            </div>
          </DashboardInnerSurface>
        </PageSection>
      </PageContent>
    </Page>
  );
}
