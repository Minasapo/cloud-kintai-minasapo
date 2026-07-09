import { useAppDispatchV2 } from "@app/hooks";
import { AuthContext } from "@app/providers/auth/AuthContext";
import { AppConfigContext } from "@entities/app-config/model/AppConfigContext";
import {
  useCreateAttendanceMutation,
  useLazyGetAttendanceByStaffAndDateQuery,
  useUpdateAttendanceMutation,
} from "@entities/attendance/api/attendanceApi";
import { useStaffs } from "@entities/staff/model/useStaffs/useStaffs";
import { getWorkflowCategoryLabel } from "@entities/workflow/lib/workflowLabels";
import useWorkflows from "@entities/workflow/model/useWorkflows";
import { WorkflowMetadataPanelBase } from "@features/workflow/detail-panel/ui/WorkflowMetadataPanel";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { Box, Step, StepLabel, Stepper } from "@mui/material";
import { GetWorkflowQuery, WorkflowStatus } from "@shared/api/graphql/types";
import { designTokenVar } from "@shared/designSystem";
import { createLogger } from "@shared/lib/logger";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useAppNotification } from "@shared/lib/useAppNotification";
import {
  AppButton,
  AppSplitButton,
  type AppSplitButtonOption,
} from "@shared/ui/button";
import { AppDialog } from "@shared/ui/feedback";
import { SectionTitle, SubsectionTitle } from "@shared/ui/typography";
import { useCallback, useContext, useMemo, useState } from "react";

import { useWorkflowApprovalActions } from "../hooks/useWorkflowApprovalActions";
import { useWorkflowDetailData } from "../hooks/useWorkflowDetailData";
import { useWorkflowDetailViewModel } from "../hooks/useWorkflowDetailViewModel";
import { useWorkflowRepair } from "../hooks/useWorkflowRepair";
import { resolveWorkflowActionState } from "../services/approvalWorkflowHelpers";
import {
  buildWorkflowRepairPlan,
  WorkflowRepairPlan,
} from "../services/workflowRepair";
import WorkflowCommentSection from "./WorkflowCommentSection";

const PANEL_BACKGROUND = designTokenVar(
  "color.surface.primary",
  "rgb(255 255 255)",
);
const PANEL_BORDER = designTokenVar("color.border.subtle", "rgb(215 224 219)");
const PANEL_RADIUS = designTokenVar("radius.lg", "12px");
const HERO_BACKGROUND = designTokenVar(
  "component.adminWorkflow.detail.hero.background",
  "linear-gradient(135deg, rgba(15, 168, 94, 0.10), rgba(11, 109, 83, 0.04))",
);
const HERO_BORDER = designTokenVar(
  "component.adminWorkflow.detail.hero.border",
  "rgba(15, 168, 94, 0.18)",
);
const HERO_TITLE = designTokenVar("color.text.primary", "rgb(30 42 37)");
const SECTION_TITLE = designTokenVar("color.text.primary", "rgb(30 42 37)");
const LOADING_TEXT = designTokenVar("color.text.muted", "rgb(94 114 104)");
const ERROR_TEXT = designTokenVar(
  "color.feedback.danger.base",
  "rgb(215 68 62)",
);
const logger = createLogger("WorkflowDetailPanel");

type WorkflowDetailHeroProps = {
  showBackButton: boolean;
  onBack?: () => void;
  handleApprove: () => void;
  isApproveDisabled: boolean;
  handleReject: () => void;
  isRejectDisabled: boolean;
  handleRepair?: () => void;
  isRepairDisabled?: boolean;
  repairActionLabel?: string | null;
};

function WorkflowDetailHero({
  showBackButton,
  onBack,
  handleApprove,
  isApproveDisabled,
  handleReject,
  isRejectDisabled,
  handleRepair,
  isRepairDisabled,
  repairActionLabel,
}: WorkflowDetailHeroProps) {
  const splitButtonOptions: AppSplitButtonOption[] = useMemo(
    () => [
      {
        key: "approve",
        label: "承認",
        disabled: isApproveDisabled,
      },
      {
        key: "reject",
        label: "却下",
        disabled: isRejectDisabled,
      },
      ...(handleRepair && repairActionLabel
        ? [
            {
              key: "repair",
              label: repairActionLabel,
              disabled: isRepairDisabled,
            },
          ]
        : []),
    ],
    [
      handleRepair,
      repairActionLabel,
      isRepairDisabled,
      isApproveDisabled,
      isRejectDisabled,
    ],
  );

  // 最初の enabled なアクションを初期値とする
  const [userSelectedAction, setUserSelectedAction] = useState<
    "approve" | "reject" | "repair" | null
  >(null);

  const selectedAction = useMemo<"approve" | "reject" | "repair">(() => {
    if (userSelectedAction !== null) {
      const option = splitButtonOptions.find(
        (opt) => opt.key === userSelectedAction,
      );
      if (!option?.disabled) {
        return userSelectedAction;
      }
    }
    const enabledOption = splitButtonOptions.find((opt) => !opt.disabled);

    // 初期表示で修復アクションを自動選択しない。
    if (enabledOption?.key === "repair") {
      return "approve";
    }

    return (enabledOption?.key ?? "approve") as "approve" | "reject" | "repair";
  }, [userSelectedAction, splitButtonOptions]);

  const handleSplitButtonAction = () => {
    if (selectedAction === "repair") {
      handleRepair?.();
    } else if (selectedAction === "approve") {
      handleApprove();
    } else if (selectedAction === "reject") {
      handleReject();
    }
  };

  const handleActionChange = (key: string) => {
    setUserSelectedAction(key as "approve" | "reject" | "repair");
  };

  return (
    <div
      className="mb-6 flex flex-col gap-4 rounded-2xl p-4 sm:p-5"
      style={{
        border: `1px solid ${HERO_BORDER}`,
        background: HERO_BACKGROUND,
      }}
    >
      {showBackButton && onBack && (
        <div>
          <AppButton
            variant="ghost"
            tone="secondary"
            size="sm"
            onClick={onBack}
            className="min-w-0"
            startIcon={<ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />}
          >
            ワークフロー一覧へ戻る
          </AppButton>
        </div>
      )}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <SectionTitle
              className="m-0 text-2xl font-extrabold leading-tight"
              style={{ color: HERO_TITLE }}
            >
              申請内容の確認
            </SectionTitle>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
          <AppSplitButton
            options={splitButtonOptions}
            selectedKey={selectedAction}
            onSelectedKeyChange={handleActionChange}
            onPrimaryClick={handleSplitButtonAction}
            variant="solid"
            tone={
              selectedAction === "reject"
                ? "danger"
                : selectedAction === "repair"
                  ? "secondary"
                  : "primary"
            }
            size="sm"
            className="w-40"
          />
        </div>
      </div>
    </div>
  );
}

type WorkflowRepairDialogProps = {
  open: boolean;
  isCheckingRepairNeed: boolean;
  isRepairing: boolean;
  repairStep: number;
  repairCompleted: boolean;
  dialogRepairPlan: WorkflowRepairPlan | null;
  onClose: () => void;
  onConfirm: () => void;
};

function WorkflowRepairDialog({
  open,
  isCheckingRepairNeed,
  isRepairing,
  repairStep,
  repairCompleted,
  dialogRepairPlan,
  onClose,
  onConfirm,
}: WorkflowRepairDialogProps) {
  return (
    <AppDialog
      open={open}
      title="データの修復"
      onClose={onClose}
      loading={false}
      maxWidth="sm"
    >
      <div className="w-full">
        <Stepper activeStep={repairStep} sx={{ mb: 3 }}>
          <Step completed={!isCheckingRepairNeed}>
            <StepLabel>修復要否の確認</StepLabel>
          </Step>
          <Step completed={repairStep > 1}>
            <StepLabel>修復内容の確認</StepLabel>
          </Step>
          <Step completed={repairCompleted}>
            <StepLabel>修復を実行</StepLabel>
          </Step>
        </Stepper>

        {isCheckingRepairNeed && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4">
              <div
                className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"
                role="status"
                aria-label="修復要否を確認中..."
              />
            </div>
            <p className="text-sm font-medium text-gray-700">
              修復の必要性を確認中...
            </p>
          </div>
        )}

        {!isCheckingRepairNeed && !dialogRepairPlan && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              データの修復の必要はありませんでした
            </p>
          </div>
        )}

        {repairStep === 1 && dialogRepairPlan && (
          <div className="space-y-4">
            <div>
              <p className="m-0 text-sm font-semibold mb-2">修復理由</p>
              <p className="m-0 text-sm text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                {dialogRepairPlan.repairReason}
              </p>
            </div>
            <div>
              <p className="m-0 text-sm font-semibold mb-2">修復内容</p>
              <ul className="m-0 space-y-2">
                {dialogRepairPlan.repairDetails.map((detail, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded"
                  >
                    <span className="text-green-600 font-bold">✓</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {repairStep === 1 && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4">
              <div
                className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"
                role="status"
                aria-label="修復中..."
              />
            </div>
            <p className="text-sm font-medium text-gray-700">修復を実行中...</p>
            <p className="text-xs text-gray-500 mt-1">しばらくお待ちください</p>
          </div>
        )}

        {repairStep === 2 && repairCompleted && (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">
              修復が完了しました
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {dialogRepairPlan?.successMessage}
            </p>
          </div>
        )}

        <Box
          sx={{ display: "flex", gap: 1, mt: 4, justifyContent: "flex-end" }}
        >
          {!isCheckingRepairNeed && !dialogRepairPlan && (
            <AppButton variant="solid" tone="primary" onClick={onClose}>
              閉じる
            </AppButton>
          )}
          {repairStep === 1 && dialogRepairPlan && (
            <>
              <AppButton
                variant="outline"
                tone="neutral"
                onClick={onClose}
                disabled={isRepairing}
              >
                キャンセル
              </AppButton>
              <AppButton
                variant="solid"
                tone="secondary"
                onClick={onConfirm}
                disabled={isRepairing}
              >
                修復する
              </AppButton>
            </>
          )}
          {repairStep === 2 && (
            <AppButton variant="solid" tone="primary" onClick={onClose}>
              閉じる
            </AppButton>
          )}
        </Box>
      </div>
    </AppDialog>
  );
}

interface WorkflowDetailPanelProps {
  workflowId?: string;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function WorkflowDetailPanel({
  workflowId,
  onBack,
  showBackButton = false,
}: WorkflowDetailPanelProps) {
  const { cognitoUser, authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const { staffs } = useStaffs({ isAuthenticated });
  const { notify } = useAppNotification();
  const {
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
  } = useContext(AppConfigContext);
  const { update: updateWorkflow } = useWorkflows({ isAuthenticated });
  const [createAttendance] = useCreateAttendanceMutation();
  const [getAttendanceByStaffAndDate] =
    useLazyGetAttendanceByStaffAndDateQuery();
  const [updateAttendance] = useUpdateAttendanceMutation();
  const currentStaffId = useMemo(() => {
    if (!cognitoUser?.id) return null;
    return (
      staffs.find((staff) => staff.cognitoUserId === cognitoUser.id)?.id ?? null
    );
  }, [cognitoUser, staffs]);
  const handleNewCommentNotification = useCallback(() => {
    notify({
      title: "新着コメントがあります",
      description: "ワークフローに新しいコメントが投稿されました",
      tone: "info",
      dedupeKey: `workflow-comment-${workflowId ?? "unknown"}`,
    });
  }, [notify, workflowId]);
  const { workflow, setWorkflow, loading, error } = useWorkflowDetailData(
    workflowId,
    {
      currentStaffId,
      onNewComment: handleNewCommentNotification,
    },
  );
  const dispatch = useAppDispatchV2();
  const { staffName, applicationDate, approvalSteps } =
    useWorkflowDetailViewModel({
      workflow,
      staffs,
    });
  const categoryLabel = getWorkflowCategoryLabel(workflow);
  const workflowActionState = resolveWorkflowActionState(workflow);
  const workflowRepairPlan = buildWorkflowRepairPlan(
    workflow,
    workflowActionState.issue,
  );
  const isApproveDisabled =
    !workflow?.id ||
    workflow.status === WorkflowStatus.APPROVED ||
    workflow.status === WorkflowStatus.REJECTED ||
    workflow.status === WorkflowStatus.CANCELLED;
  const isRejectDisabled =
    !workflow?.id ||
    workflow.status === WorkflowStatus.REJECTED ||
    workflow.status === WorkflowStatus.CANCELLED;
  const { handleApprove, handleReject } = useWorkflowApprovalActions({
    workflow,
    cognitoUser,
    staffs,
    updateWorkflow: (input) =>
      updateWorkflow(input) as Promise<
        NonNullable<GetWorkflowQuery["getWorkflow"]>
      >,
    setWorkflow,
    notifySuccess: (message) =>
      dispatch(pushNotification({ tone: "success", message })),
    notifyError: (message) =>
      dispatch(pushNotification({ tone: "error", message })),
    notifyInfo: (title, description) =>
      dispatch(
        pushNotification({
          tone: "info",
          message: title,
          description,
          autoHideMs: null,
        }),
      ),
    getStartTime,
    getEndTime,
    getLunchRestStartTime,
    getLunchRestEndTime,
    getAttendanceByStaffAndDate,
    createAttendance,
    updateAttendance,
  });
  const {
    isRepairConfirmOpen,
    isRepairing,
    repairStep,
    repairCompleted,
    isCheckingRepairNeed,
    dialogRepairPlan,
    handleRepairClick,
    handleRepairConfirm,
    handleRepairDialogClose,
  } = useWorkflowRepair({
    workflowId: workflow?.id ?? null,
    workflowRepairPlan,
    executeRepair: (input) =>
      updateWorkflow(input) as Promise<
        NonNullable<GetWorkflowQuery["getWorkflow"]>
      >,
    onRepaired: setWorkflow,
    notify,
  });
  return (
    <section
      className="w-full p-4 sm:p-6"
      style={{
        borderRadius: PANEL_RADIUS,
        border: `1px solid ${PANEL_BORDER}`,
        backgroundColor: PANEL_BACKGROUND,
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
      }}
    >
      <WorkflowDetailHero
        showBackButton={showBackButton}
        onBack={onBack}
        handleApprove={handleApprove}
        isApproveDisabled={isApproveDisabled}
        handleReject={handleReject}
        isRejectDisabled={isRejectDisabled}
        handleRepair={handleRepairClick}
        isRepairDisabled={false}
        repairActionLabel="データを自動修復"
      />

      <WorkflowRepairDialog
        open={isRepairConfirmOpen}
        isCheckingRepairNeed={isCheckingRepairNeed}
        isRepairing={isRepairing}
        repairStep={repairStep}
        repairCompleted={repairCompleted}
        dialogRepairPlan={dialogRepairPlan}
        onClose={handleRepairDialogClose}
        onConfirm={handleRepairConfirm}
      />

      {loading && (
        <p className="m-0 text-sm" style={{ color: LOADING_TEXT }}>
          読み込み中...
        </p>
      )}

      {error && (
        <p className="m-0 text-sm" style={{ color: ERROR_TEXT }}>
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="min-w-0 xl:col-span-7">
            <SubsectionTitle
              className="mb-2 text-base font-bold"
              style={{ color: SECTION_TITLE }}
            >
              申請情報
            </SubsectionTitle>
            <WorkflowMetadataPanelBase
              workflowId={workflow?.id ?? undefined}
              fallbackId={workflowId}
              category={workflow?.category ?? null}
              categoryLabel={categoryLabel}
              staffName={staffName}
              applicationDate={applicationDate}
              status={workflow?.status ?? null}
              overTimeDetails={workflow?.overTimeDetails ?? null}
              customWorkflowTitle={workflow?.customWorkflowTitle ?? null}
              customWorkflowContent={workflow?.customWorkflowContent ?? null}
              approvalSteps={approvalSteps}
            />
          </div>

          <div className="min-w-0 xl:col-span-5">
            <SubsectionTitle
              className="mb-2 text-base font-bold"
              style={{ color: SECTION_TITLE }}
            >
              コメントと対応履歴
            </SubsectionTitle>
            <WorkflowCommentSection
              workflow={workflow}
              staffs={staffs}
              cognitoUser={cognitoUser}
              onWorkflowUpdated={setWorkflow}
              onSuccess={(message) =>
                dispatch(
                  pushNotification({
                    tone: "success",
                    message: message,
                  }),
                )
              }
              onError={(message) => {
                logger.error("Failed to send comment:", message);
                dispatch(
                  pushNotification({
                    tone: "error",
                    message: message,
                  }),
                );
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
