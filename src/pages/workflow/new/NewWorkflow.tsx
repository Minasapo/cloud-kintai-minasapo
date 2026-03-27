import useAppConfig from "@entities/app-config/model/useAppConfig";
import {
  StaffType,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import useWorkflowTemplates from "@entities/workflow-template/model/useWorkflowTemplates";
import {
  ApprovalStatus,
  ApprovalStepInput,
  ApproverMultipleMode,
  ApproverSettingMode,
  WorkflowCategory,
} from "@shared/api/graphql/types";
import Page from "@shared/ui/page/Page";
import React, { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "@/context/AuthContext";
import {
  CATEGORY_LABELS,
  getEnabledWorkflowCategories,
} from "@/entities/workflow/lib/workflowLabels";
import { useNewWorkflowForm } from "@/features/workflow/application-form/model/useNewWorkflowForm";
import { WorkflowFormProvider } from "@/features/workflow/application-form/model/WorkflowFormContext";
import {
  buildCreateWorkflowInput,
  CLOCK_CORRECTION_CHECK_OUT_LABEL,
  CLOCK_CORRECTION_LABEL,
  validateWorkflowForm,
} from "@/features/workflow/application-form/model/workflowFormModel";
import WorkflowTypeFields from "@/features/workflow/application-form/ui/WorkflowTypeFields";
import { sendWorkflowSubmissionNotification } from "@/features/workflow/notifications/sendWorkflowSubmissionNotification";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { createLogger } from "@/shared/lib/logger";
import { parseTimeToISO } from "@/shared/lib/time";
import { DashboardInnerSurface, PageSection } from "@/shared/ui/layout";

import styles from "./NewWorkflow.module.scss";

const logger = createLogger("NewWorkflow");

const WORKFLOW_TEMPLATE_ORGANIZATION_ID = "default";

const generateApprovalSteps = (
  staff: StaffType,
  staffs: StaffType[],
): {
  approvalSteps: ApprovalStepInput[];
  assignedApproverStaffIds: string[];
} => {
  const approvalSteps: ApprovalStepInput[] = [];
  const assignedApproverStaffIds: string[] = [];

  if (staff?.approverSetting === ApproverSettingMode.SINGLE) {
    const target = staff.approverSingle;
    if (target) {
      const mapped = staffs.find(
        (s) => s.cognitoUserId === target || s.id === target,
      );
      const approverId = mapped ? mapped.id : target;
      approvalSteps.push({
        id: `s-0-${Date.now()}`,
        approverStaffId: approverId,
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
        stepOrder: 0,
      });
      assignedApproverStaffIds.push(approverId);
    }
  } else if (staff?.approverSetting === ApproverSettingMode.MULTIPLE) {
    const multiple = staff.approverMultiple || [];
    multiple.forEach((aid, idx) => {
      if (!aid) return;
      const mapped = staffs.find(
        (s) => s.cognitoUserId === aid || s.id === aid,
      );
      const approverId = mapped ? mapped.id : aid;
      approvalSteps.push({
        id: `s-${idx}-${Date.now()}`,
        approverStaffId: approverId,
        decisionStatus: ApprovalStatus.PENDING,
        approverComment: null,
        decisionTimestamp: null,
        stepOrder: idx,
      });
      assignedApproverStaffIds.push(approverId);
    });
  } else if (staff?.approverSetting === ApproverSettingMode.ADMINS) {
    approvalSteps.push({
      id: `s-admin-${Date.now()}`,
      approverStaffId: "ADMINS",
      decisionStatus: ApprovalStatus.PENDING,
      approverComment: null,
      decisionTimestamp: null,
      stepOrder: 0,
    });
    assignedApproverStaffIds.push("ADMINS");
  }

  return { approvalSteps, assignedApproverStaffIds };
};

const extractErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (typeof err === "object" && err !== null) {
    if ("data" in err && typeof err.data === "object" && err.data !== null) {
      const data = err.data as Record<string, unknown>;
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
      if (
        "errors" in data &&
        Array.isArray(data.errors) &&
        data.errors.length > 0
      ) {
        const firstError = data.errors[0];
        if (
          typeof firstError === "object" &&
          firstError !== null &&
          "message" in firstError
        ) {
          return String(firstError.message);
        }
      }
    }
    if ("message" in err && typeof err.message === "string") return err.message;
    if ("error" in err && typeof err.error === "string") return err.error;
  }
  return "ワークフローの作成に失敗しました。";
};

const buildCategoryOptions = (
  options: ReturnType<typeof getEnabledWorkflowCategories>,
) =>
  options.flatMap((item) => {
    if (item.category === WorkflowCategory.CLOCK_CORRECTION) {
      return [
        <option key={`${item.category}-clock-in`} value={CLOCK_CORRECTION_LABEL}>
          {CLOCK_CORRECTION_LABEL}
        </option>,
        <option key={`${item.category}-clock-out`} value={CLOCK_CORRECTION_CHECK_OUT_LABEL}>
          {CLOCK_CORRECTION_CHECK_OUT_LABEL}
        </option>,
      ];
    }
    const label = CATEGORY_LABELS[item.category] ?? item.label;
    return [
      <option key={item.category} value={label}>
        {label}
      </option>,
    ];
  });

const FormRow = ({
  label,
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) => (
  <div className={styles.formRow}>
    {label && <div className={styles.formLabel}>{label}</div>}
    {children}
  </div>
);

export default function NewWorkflow() {
  const navigate = useNavigate();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";

  const { staffs } = useStaffs({ isAuthenticated });
  const { create: createWorkflow } = useWorkflows({ isAuthenticated });
  const { templates } = useWorkflowTemplates({
    isAuthenticated,
    organizationId: WORKFLOW_TEMPLATE_ORGANIZATION_ID,
  });
  const { notify } = useLocalNotification();
  const { config, getStartTime, getEndTime, getAbsentEnabled } = useAppConfig();

  const {
    draftMode,
    handleDraftToggle,
    category,
    setCategory,
    applicationDate,
    formState,
    errors,
    applyValidationErrors,
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
    overtimeStart,
    setOvertimeStart,
    overtimeEnd,
    setOvertimeEnd,
    overtimeDate,
    setOvertimeDate,
    overtimeReason,
    setOvertimeReason,
    customWorkflowTitle,
    setCustomWorkflowTitle,
    customWorkflowContent,
    setCustomWorkflowContent,
    selectedTemplateId,
    setSelectedTemplateId,
  } = useNewWorkflowForm();

  const enabledCategoryOptions = useMemo(
    () =>
      getEnabledWorkflowCategories(config).filter((item) => {
        if (item.category === WorkflowCategory.ABSENCE && !getAbsentEnabled()) {
          return false;
        }
        return true;
      }),
    [config, getAbsentEnabled],
  );

  const staff = useMemo(() => {
    if (!cognitoUser?.id) return undefined;
    return staffs.find((s) => s.cognitoUserId === cognitoUser.id) || null;
  }, [staffs, cognitoUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateWorkflowForm(formState);
    applyValidationErrors(validation.errors);
    if (!validation.isValid) return;

    if (!staff?.id) {
      void notify("エラー", {
        body: "申請者情報が取得できませんでした。",
        mode: "await-interaction",
        priority: "high",
        tag: "workflow-applicant-error",
      });
      return;
    }

    const input = buildCreateWorkflowInput({
      staffId: staff.id,
      draftMode,
      state: formState,
      overtimeDateFallbackFactory: () => new Date().toISOString().slice(0, 10),
    });

    const { approvalSteps, assignedApproverStaffIds } = generateApprovalSteps(
      staff,
      staffs,
    );
    if (approvalSteps.length > 0) {
      input.approvalSteps = approvalSteps;
      input.assignedApproverStaffIds = assignedApproverStaffIds;
      input.nextApprovalStepIndex = 0;
    }

    if (staff?.approverSetting) {
      input.submitterApproverSetting =
        staff.approverSetting as ApproverSettingMode;
      if (staff.approverSingle)
        input.submitterApproverId = staff.approverSingle;
      if (staff.approverMultiple && staff.approverMultiple.length > 0) {
        input.submitterApproverIds = staff.approverMultiple;
        if (staff.approverMultipleMode)
          input.submitterApproverMultipleMode =
            staff.approverMultipleMode as ApproverMultipleMode;
      }
    }

    try {
      const createdWorkflow = await createWorkflow(input);

      if (!draftMode) {
        try {
          await sendWorkflowSubmissionNotification({
            staffs,
            applicant: staff,
            workflow: createdWorkflow,
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

      void notify("ワークフローを作成しました。", { mode: "auto-close" });
      navigate("/workflow", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow creation failed:", message);
      void notify("エラー", {
        body: extractErrorMessage(err),
        mode: "await-interaction",
        priority: "high",
      });
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setCategory(v);
    const today = new Date().toISOString().slice(0, 10);
    if (v === "有給休暇申請") {
      setStartDate(today);
      setEndDate(today);
      if (!paidReason) setPaidReason("私用のため");
    } else if (v === CLOCK_CORRECTION_LABEL) {
      setOvertimeDate(today);
      const isoTime = parseTimeToISO(getStartTime().format("HH:mm"), today);
      setOvertimeStart(isoTime);
      setOvertimeEnd(null);
    } else if (v === CLOCK_CORRECTION_CHECK_OUT_LABEL) {
      setOvertimeDate(today);
      const defaultEndTime = getEndTime();
      setOvertimeEnd(
        defaultEndTime
          ? parseTimeToISO(defaultEndTime.format("HH:mm"), today)
          : null,
      );
      setOvertimeStart(null);
    }
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplateId) return;

    const targetTemplate = templates.find((t) => t.id === selectedTemplateId);
    if (!targetTemplate) {
      void notify("エラー", {
        body: "テンプレートが見つかりませんでした。",
        mode: "await-interaction",
        priority: "high",
        tag: "workflow-template-not-found",
      });
      return;
    }

    const hasCurrentValue =
      customWorkflowTitle.trim().length > 0 ||
      customWorkflowContent.trim().length > 0;
    const confirmMessage = hasCurrentValue
      ? "現在入力しているタイトル・詳細をテンプレート内容で上書きします。よろしいですか？"
      : "テンプレートを適用しますか？";
    if (!window.confirm(confirmMessage)) return;

    setCustomWorkflowTitle(targetTemplate.title);
    setCustomWorkflowContent(targetTemplate.content);
  };

  const workflowFormContextValue = {
    category,
    disabled: category === "",
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    dateError: errors.dateError,
    paidReason,
    setPaidReason,
    absenceDate,
    setAbsenceDate,
    absenceDateError: errors.absenceDateError,
    absenceReason,
    setAbsenceReason,
    overtimeDate,
    setOvertimeDate,
    overtimeDateError: errors.overtimeDateError,
    overtimeStart,
    setOvertimeStart,
    overtimeEnd,
    setOvertimeEnd,
    overtimeError: errors.overtimeError,
    overtimeReason,
    setOvertimeReason,
    customWorkflowTitle,
    setCustomWorkflowTitle,
    customWorkflowContent,
    setCustomWorkflowContent,
    customWorkflowTitleError: errors.customWorkflowTitleError,
    customWorkflowContentError: errors.customWorkflowContentError,
    templateOptions: templates.map((t) => ({ id: t.id, name: t.name })),
    selectedTemplateId,
    setSelectedTemplateId,
    onApplyTemplate: handleApplyTemplate,
    disableTemplateApply: !selectedTemplateId,
  };

  return (
    <Page title="新規作成" maxWidth="lg" showDefaultHeader={false}>
      <PageSection
        component="form"
        layoutVariant="dashboard"
        onSubmit={handleSubmit}
        sx={{ gap: 0 }}
      >
        <div style={{ marginBottom: "1rem" }}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => navigate("/workflow")}
          >
            申請一覧へ戻る
          </button>
        </div>

        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>新規作成</h2>
            <p className={styles.pageSubtitle}>
              申請一覧を起点に、申請内容を作成します。
            </p>
          </div>
        </div>

        <DashboardInnerSurface>
          <div className={styles.formRows}>
            <FormRow label="種別">
              <div>
                <div className={styles.selectWrap}>
                  <select
                    className={styles.select}
                    value={category}
                    onChange={handleCategoryChange}
                  >
                    <option value="">種別を選択</option>
                    {buildCategoryOptions(enabledCategoryOptions)}
                  </select>
                  <span className={styles.selectIcon} aria-hidden="true">
                    ▼
                  </span>
                </div>
              </div>
            </FormRow>

            <FormRow label="申請者">
              <p className={styles.formValue}>
                {staff ? `${staff.familyName} ${staff.givenName}` : "—"}
              </p>
            </FormRow>

            <FormRow label="申請日">
              <div>
                <input
                  className={styles.readonlyInput}
                  value={applicationDate}
                  readOnly
                />
              </div>
            </FormRow>

            <WorkflowFormProvider value={workflowFormContextValue}>
              <WorkflowTypeFields />
            </WorkflowFormProvider>

            <FormRow label="下書き">
              <div>
                <label className={styles.toggleWrap}>
                  <input
                    type="checkbox"
                    className={styles.toggleInput}
                    checked={draftMode}
                    onChange={handleDraftToggle}
                  />
                  <span className={styles.toggleTrack} />
                  {draftMode && (
                    <span className={styles.toggleLabelText}>
                      下書きとして保存
                    </span>
                  )}
                </label>
              </div>
            </FormRow>

            <FormRow>
              <div className={styles.formActions}>
                <div className={styles.actionsGroup}>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={category === ""}
                  >
                    作成
                  </button>
                </div>
              </div>
            </FormRow>
          </div>
        </DashboardInnerSurface>
      </PageSection>
    </Page>
  );
}
