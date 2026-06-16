import { Workflow as WorkflowType } from "@shared/api/graphql/types";
import { AppButton } from "@shared/ui/button";
import { SectionTitle } from "@shared/ui/typography";

import { useWorkflowCarouselKeyboard } from "../hooks/useWorkflowCarouselKeyboard";
import { useWorkflowCarouselState } from "../hooks/useWorkflowCarouselState";
import WorkflowCarouselActionButtons from "./WorkflowCarouselActionButtons";
import WorkflowDetailGrid from "./WorkflowDetailGrid";

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M12.5 4.5 7 10l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5">
      <path
        d="M5 5l10 10M15 5 5 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function OpenInPanelIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path
        d="M7 5h8v8m0-8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 11v4H5V7h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


interface WorkflowCarouselDialogProps {
  open: boolean;
  onClose: () => void;
  selectedWorkflowId: string;
  filteredWorkflowIds: string[];
  workflowsById: Map<string, WorkflowType>;
  staffNamesById: Map<string, string>;
  onOpenInRightPanel: (workflowId: string) => void;
  enableApprovalActions?: boolean;
}

export default function WorkflowCarouselDialog({
  open,
  onClose,
  selectedWorkflowId,
  filteredWorkflowIds,
  workflowsById,
  staffNamesById,
  onOpenInRightPanel,
  enableApprovalActions = false,
}: WorkflowCarouselDialogProps) {
  const {
    currentIndex,
    isCompleted,
    dialogRef,
    closeButtonRef,
    currentWorkflowId,
    currentWorkflow,
    canGoPrev,
    canGoNext,
    isApproveDisabled,
    isRejectDisabled,
    handlePrev,
    handleNext,
    handleApproveAndNext,
    handleRejectAndNext,
  } = useWorkflowCarouselState({
    selectedWorkflowId,
    filteredWorkflowIds,
    workflowsById,
    enableApprovalActions,
  });

  useWorkflowCarouselKeyboard({
    open,
    onClose,
    isCompleted,
    currentWorkflowId,
    handlePrev,
    handleNext,
    handleApproveAndNext,
    handleRejectAndNext,
    enableApprovalActions,
    onOpenInRightPanel,
    dialogRef,
    closeButtonRef,
  });

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-950/50 p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="ワークフローをまとめて確認"
        className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_24px_60px_-36px_rgba(15,23,42,0.55)]"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
          <SectionTitle className="m-0 text-base font-semibold text-slate-900 sm:text-lg">
            ワークフローをまとめて確認
          </SectionTitle>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-auto px-4 py-4 sm:px-5">
          {isCompleted ? (
            <div className="space-y-4 py-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-6">
                <p className="m-0 text-xs font-semibold tracking-[0.12em] text-emerald-700">
                  CONFIRMATION COMPLETE
                </p>
                <p className="m-0 mt-2 text-lg font-semibold text-slate-900">
                  確認が完了しました
                </p>
                <p className="m-0 mt-2 text-sm leading-6 text-slate-600">
                  対象の申請を最後まで処理しました。必要に応じて一覧へ戻って次の確認を開始してください。
                </p>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-3">
                <AppButton
                  variant="outline"
                  tone="secondary"
                  size="sm"
                  onClick={onClose}
                  className="min-w-0"
                >
                  閉じる
                </AppButton>
              </div>
            </div>
          ) : currentWorkflow ? (
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <WorkflowDetailGrid
                  currentWorkflow={currentWorkflow}
                  staffNamesById={staffNamesById}
                  currentIndex={currentIndex}
                  totalCount={filteredWorkflowIds.length}
                />

                <AppButton
                  variant="outline"
                  tone="secondary"
                  size="sm"
                  onClick={() =>
                    currentWorkflowId && onOpenInRightPanel(currentWorkflowId)
                  }
                  disabled={!currentWorkflowId}
                  startIcon={<OpenInPanelIcon />}
                  className="min-w-0"
                >
                  右側で開く
                </AppButton>
              </div>

              {enableApprovalActions && currentWorkflowId && (
                <WorkflowCarouselActionButtons
                  onApproveAndNext={handleApproveAndNext}
                  onRejectAndNext={handleRejectAndNext}
                  isApproveDisabled={isApproveDisabled}
                  isRejectDisabled={isRejectDisabled}
                />
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <AppButton
                  variant="outline"
                  tone="secondary"
                  size="sm"
                  onClick={handlePrev}
                  disabled={!canGoPrev}
                  startIcon={<ChevronLeftIcon />}
                  className="min-w-0"
                >
                  前へ
                </AppButton>
                <AppButton
                  variant="outline"
                  tone="secondary"
                  size="sm"
                  onClick={handleNext}
                  disabled={!canGoNext}
                  endIcon={<ChevronRightIcon />}
                  className="min-w-0"
                >
                  次へ
                </AppButton>
              </div>
            </div>
          ) : (
            <p className="m-0 py-6 text-sm text-slate-500">
              表示できるワークフローがありません。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
