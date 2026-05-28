import { useDialogFocusManagement } from "@shared/ui/feedback/useDialogFocusManagement";
import { useRef } from "react";

import { DailyReportCarouselDialogBody } from "./components/DailyReportCarouselDialogBody";
import { DailyReportCarouselDialogFooter } from "./components/DailyReportCarouselDialogFooter";
import { DailyReportCarouselDialogHeader } from "./components/DailyReportCarouselDialogHeader";
import { DailyReportCarouselNavigation } from "./components/DailyReportCarouselNavigation";
import type { AdminDailyReport } from "./data";
import { useDailyReportCarouselInteractions } from "./hooks/useDailyReportCarouselInteractions";
import { useDailyReportCarouselState } from "./hooks/useDailyReportCarouselState";

interface DailyReportCarouselDialogProps {
  open: boolean;
  onClose: () => void;
  selectedReport: AdminDailyReport;
  filteredReports: AdminDailyReport[];
}

export default function DailyReportCarouselDialog({
  open,
  onClose,
  selectedReport,
  filteredReports,
}: DailyReportCarouselDialogProps) {
  const {
    currentIndex,
    report,
    setReport,
    isLoading,
    loadError,
    isStaffLoading,
    reactionEntries,
    setReactionEntries,
    commentEntries,
    setCommentEntries,
    staffs,
    currentStaffId,
    currentStaffName,
    isResolvingCurrentStaff,
    buildStaffName,
    selectedReactions,
    reactions,
    comments,
    handlePrevious,
    handleNext,
  } = useDailyReportCarouselState({
    open,
    selectedReport,
    filteredReports,
  });

  const {
    commentInput,
    actionError,
    clearActionError,
    handleToggleReaction,
    handleSubmitComment,
    chipsDisabled,
    isCommentDisabled,
    setCommentInput,
  } = useDailyReportCarouselInteractions({
    report,
    reactionEntries,
    commentEntries,
    setReport,
    setReactionEntries,
    setCommentEntries,
    currentStaffId,
    currentStaffName,
    isResolvingCurrentStaff,
    staffs,
    buildStaffName,
  });

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useDialogFocusManagement({
    open,
    onClose,
    dialogRef,
    initialFocusRef: closeButtonRef,
    onKeyDown: (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
      }
    },
  });

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
      data-testid="daily-report-carousel-dialog"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="日報を確認"
        tabIndex={-1}
        className="flex h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <DailyReportCarouselDialogHeader
          onClose={onClose}
          closeButtonRef={closeButtonRef}
        />
        <DailyReportCarouselNavigation
          currentIndex={currentIndex}
          totalCount={filteredReports.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
        <DailyReportCarouselDialogBody
          isLoading={isLoading}
          isStaffLoading={isStaffLoading}
          loadError={loadError}
          report={report}
          actionError={actionError}
          onClearActionError={clearActionError}
          reactions={reactions}
          selectedReactions={selectedReactions}
          chipsDisabled={chipsDisabled}
          onToggleReaction={(type) => {
            void handleToggleReaction(type);
          }}
          comments={comments}
        />
        <DailyReportCarouselDialogFooter
          commentInput={commentInput}
          onCommentInputChange={setCommentInput}
          onClearActionError={clearActionError}
          onSubmitComment={() => {
            void handleSubmitComment();
          }}
          isCommentDisabled={isCommentDisabled}
        />
      </div>
    </div>
  );
}
