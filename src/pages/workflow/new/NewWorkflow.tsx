import { AuthContext } from "@app/providers/auth/AuthContext";
import useAppConfig from "@entities/app-config/model/useAppConfig";
import {
  StaffType,
  useStaffs,
} from "@entities/staff/model/useStaffs/useStaffs";
import {
  CATEGORY_LABELS,
  getEnabledWorkflowCategories,
} from "@entities/workflow/lib/workflowLabels";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { DynamicWorkflowFormProvider } from "@features/workflow/application-form/model/DynamicWorkflowFormContext";
import {
  buildDynamicCreateWorkflowInput,
  validateDynamicWorkflowForm,
} from "@features/workflow/application-form/model/dynamicWorkflowFormModel";
import { useDynamicWorkflowForm } from "@features/workflow/application-form/model/useDynamicWorkflowForm";
import DynamicWorkflowTypeFields from "@features/workflow/application-form/ui/DynamicWorkflowTypeFields";
import { sendWorkflowSubmissionNotification } from "@features/workflow/notifications/sendWorkflowSubmissionNotification";
import {
  ApprovalStatus,
  ApprovalStepInput,
  ApproverMultipleMode,
  ApproverSettingMode,
  WorkflowCategory,
} from "@shared/api/graphql/types";
import { designTokenVar } from "@shared/designSystem";
import { createLogger } from "@shared/lib/logger";
import { parseTimeToISO } from "@shared/lib/time";
import { useAppNotification } from "@shared/lib/useAppNotification";
import { AppBackButton, AppButton } from "@shared/ui/button";
import { usePageLeaveGuard } from "@shared/ui/feedback/usePageLeaveGuard";
import {
  AppFormControlLabel,
  AppSelect,
  AppSwitch,
  AppTextField,
} from "@shared/ui/form";
import {
  DashboardInnerSurface,
  PageContent,
  PageSection,
} from "@shared/ui/layout";
import Page from "@shared/ui/page/Page";
import { SectionTitle } from "@shared/ui/typography";
import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./NewWorkflow.module.scss";

// ワークフロー種別ラベル定数（YAML 由来の値と合わせる）
const CLOCK_CORRECTION_LABEL = "打刻修正(出勤忘れ)";
const CLOCK_CORRECTION_CHECK_OUT_LABEL = "打刻修正(退勤忘れ)";

const SUBMIT_BUTTON_SX = {
  borderRadius: "999px",
  padding: "0.375rem 1.4rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: designTokenVar("color.neutral.0", "rgb(255 255 255)"),
  backgroundColor: designTokenVar(
    "color.feedback.success.base",
    "rgb(25 185 133)",
  ),
  boxShadow:
    "inset 0 -2px 0 rgba(0, 0, 0, 0.12), 0 12px 24px -18px rgba(5, 150, 105, 0.55)",
  "&:hover": {
    backgroundColor: designTokenVar(
      "color.feedback.success.base",
      "rgb(23 171 123)",
    ),
    boxShadow:
      "inset 0 -2px 0 rgba(0, 0, 0, 0.12), 0 14px 28px -18px rgba(5, 150, 105, 0.6)",
  },
  "&.Mui-disabled": {
    backgroundColor: designTokenVar("color.neutral.200", "rgb(226 232 240)"),
    color: designTokenVar("color.neutral.500", "rgb(100 116 139)"),
    boxShadow: "none",
  },
} as const;

const logger = createLogger("NewWorkflow");

const getTodayAsISO = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

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
        { value: CLOCK_CORRECTION_LABEL, label: CLOCK_CORRECTION_LABEL },
        {
          value: CLOCK_CORRECTION_CHECK_OUT_LABEL,
          label: CLOCK_CORRECTION_CHECK_OUT_LABEL,
        },
      ];
    }
    const label = CATEGORY_LABELS[item.category] ?? item.label;
    return [{ value: label, label }];
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

type WorkflowFormContentProps = {
  category: string;
  enabledCategoryOptions: ReturnType<typeof getEnabledWorkflowCategories>;
  staff: StaffType | null | undefined;
  applicationDateISO: string;
  fields: ReturnType<typeof useDynamicWorkflowForm>["fields"];
  setFieldValue: ReturnType<typeof useDynamicWorkflowForm>["setFieldValue"];
  fieldErrors: Record<string, string>;
  draftMode: boolean;
  isSaving: boolean;
  onCategoryChange: (value: string | "") => void;
  onDraftToggle: (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
};

const WorkflowFormContent = ({
  category,
  enabledCategoryOptions,
  staff,
  applicationDateISO,
  fields,
  setFieldValue,
  fieldErrors,
  draftMode,
  isSaving,
  onCategoryChange,
  onDraftToggle,
}: WorkflowFormContentProps) => (
  <DashboardInnerSurface>
    <div className={styles.formRows}>
      <FormRow label="種別">
        <AppSelect
          label="種別"
          labelId="workflow-category-label"
          value={category}
          options={buildCategoryOptions(enabledCategoryOptions)}
          onChange={onCategoryChange}
          placeholder="種別を選択"
          sx={{ width: "100%" }}
        />
      </FormRow>

      <FormRow label="申請者">
        <p className={styles.formValue}>
          {staff ? `${staff.familyName} ${staff.givenName}` : "—"}
        </p>
      </FormRow>

      <FormRow label="申請日">
        <AppTextField
          type="date"
          size="small"
          value={applicationDateISO}
          disabled
          sx={{ width: "100%" }}
        />
      </FormRow>

      <DynamicWorkflowFormProvider
        value={{
          category,
          disabled: category === "",
          fields,
          setFieldValue,
          fieldErrors,
        }}
      >
        <DynamicWorkflowTypeFields />
      </DynamicWorkflowFormProvider>

      <FormRow label="下書き">
        <AppFormControlLabel
          control={<AppSwitch checked={draftMode} onChange={onDraftToggle} />}
          label="下書きとして保存"
        />
      </FormRow>

      <FormRow>
        <div className={styles.formActions}>
          <div className={styles.actionsGroup}>
            <AppButton
              type="submit"
              disabled={category === "" || isSaving}
              loading={isSaving}
              sx={SUBMIT_BUTTON_SX}
            >
              {isSaving ? "処理中..." : "作成"}
            </AppButton>
          </div>
        </div>
      </FormRow>
    </div>
  </DashboardInnerSurface>
);

export default function NewWorkflow() {
  const navigate = useNavigate();
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";

  const { staffs } = useStaffs({ isAuthenticated });
  const { create: createWorkflow } = useWorkflows({ isAuthenticated });
  const { notify } = useAppNotification();
  const { config, getStartTime, getEndTime, getAbsentEnabled } = useAppConfig();

  const [draftMode, setDraftMode] = useState(false);
  const [category, setCategory] = useState("");
  const applicationDateISO = getTodayAsISO();

  const {
    fields,
    setFieldValue,
    resetFields,
    isDirty: isFieldsDirty,
  } = useDynamicWorkflowForm();

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isDirty = draftMode || category !== "" || isFieldsDirty;

  const { dialog, runWithoutGuard } = usePageLeaveGuard({
    isDirty,
    isBusy: isSaving,
  });

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

    const state = { categoryLabel: category, fields };
    const validation = validateDynamicWorkflowForm(state);
    setFieldErrors(validation.fieldErrors);
    if (!validation.isValid) return;

    if (!staff?.id) {
      notify({
        title: "エラー",
        description: "申請者情報が取得できませんでした。",
        tone: "error",
        dedupeKey: "workflow-applicant-error",
      });
      return;
    }

    const input = buildDynamicCreateWorkflowInput({
      staffId: staff.id,
      draftMode,
      state,
    });

    const { approvalSteps, assignedApproverStaffIds } = generateApprovalSteps(
      staff,
      staffs,
    );
    // If no approval steps generated (no approver setting), fallback to ADMINS
    const stepsToUse =
      approvalSteps.length > 0
        ? approvalSteps
        : [
            {
              id: `fallback-admin-${Date.now()}`,
              approverStaffId: "ADMINS",
              decisionStatus: ApprovalStatus.PENDING,
              approverComment: null,
              decisionTimestamp: null,
              stepOrder: 0,
            },
          ];
    const approversToUse =
      approvalSteps.length > 0 ? assignedApproverStaffIds : ["ADMINS"];

    input.approvalSteps = stepsToUse;
    input.assignedApproverStaffIds = approversToUse;
    input.nextApprovalStepIndex = 0;

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
      setIsSaving(true);
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
          notify({
            title: "メール送信エラー",
            description: "管理者への通知メールの送信に失敗しました。",
            tone: "error",
            dedupeKey: "workflow-mail-error",
          });
        }
      }

      notify({
        title: "ワークフローを作成しました。",
        tone: "success",
      });
      runWithoutGuard(() => navigate("/workflow", { replace: true }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error("Workflow creation failed:", message);
      notify({
        title: "エラー",
        description: extractErrorMessage(err),
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (v: string | "") => {
    setCategory(v);
    setFieldErrors({});

    const today = new Date().toISOString().slice(0, 10);

    // 種別切り替え時にフィールドをリセットしてデフォルト値を設定
    if (v === "有給休暇申請") {
      resetFields({
        dateRange: { start: today, end: today },
        reason: "私用のため",
      });
    } else if (v === CLOCK_CORRECTION_LABEL) {
      const isoTime = parseTimeToISO(getStartTime().format("HH:mm"), today);
      resetFields({ date: today, checkInTime: isoTime });
    } else if (v === CLOCK_CORRECTION_CHECK_OUT_LABEL) {
      const defaultEndTime = getEndTime();
      resetFields({
        date: today,
        checkOutTime: defaultEndTime
          ? parseTimeToISO(defaultEndTime.format("HH:mm"), today)
          : null,
      });
    } else if (v === "残業申請") {
      resetFields({
        date: today,
        timeRange: { start: null, end: null },
        reason: "",
      });
    } else if (v === "欠勤申請") {
      resetFields({ date: today, reason: "" });
    } else if (v === "振替休暇申請") {
      resetFields({ targetDate: today, compensatoryDate: today, reason: "" });
    } else {
      resetFields();
    }
  };

  const handleDraftToggle = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setDraftMode(checked);
  };

  return (
    <Page title="新規作成" width="full" showDefaultHeader={false}>
      {dialog}
      <PageContent width="form">
        <PageSection
          component="form"
          layoutVariant="dashboard"
          onSubmit={handleSubmit}
          sx={{ gap: 0 }}
        >
          <div style={{ marginBottom: "1rem" }}>
            <AppBackButton
              type="button"
              variant="ghost"
              tone="neutral"
              size="sm"
              onClick={() => navigate("/workflow")}
            >
              申請一覧へ戻る
            </AppBackButton>
          </div>

          <div className={styles.pageHeader}>
            <div>
              <SectionTitle className={styles.pageTitle}>新規作成</SectionTitle>
              <p className={styles.pageSubtitle}>
                申請一覧を起点に、申請内容を作成します。
              </p>
            </div>
          </div>

          <WorkflowFormContent
            category={category}
            enabledCategoryOptions={enabledCategoryOptions}
            staff={staff}
            applicationDateISO={applicationDateISO}
            fields={fields}
            setFieldValue={setFieldValue}
            fieldErrors={fieldErrors}
            draftMode={draftMode}
            isSaving={isSaving}
            onCategoryChange={handleCategoryChange}
            onDraftToggle={handleDraftToggle}
          />
        </PageSection>
      </PageContent>
    </Page>
  );
}
