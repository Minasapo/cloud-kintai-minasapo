import { AppSplitButton, type AppSplitButtonOption } from "@shared/ui/button";
import { useState } from "react";

const APPROVE_OPTIONS: AppSplitButtonOption[] = [
  { key: "approve-and-next", label: "承認して次へ" },
  { key: "approve-only", label: "承認" },
];

const REJECT_OPTIONS: AppSplitButtonOption[] = [
  { key: "reject-and-next", label: "却下して次へ" },
  { key: "reject-only", label: "却下" },
];

type WorkflowCarouselActionButtonsProps = {
  onApproveAndNext: () => void;
  onApproveOnly: () => void;
  onRejectAndNext: () => void;
  onRejectOnly: () => void;
  isApproveDisabled: boolean;
  isRejectDisabled: boolean;
};

export default function WorkflowCarouselActionButtons({
  onApproveAndNext,
  onApproveOnly,
  onRejectAndNext,
  onRejectOnly,
  isApproveDisabled,
  isRejectDisabled,
}: WorkflowCarouselActionButtonsProps) {
  const [approveKey, setApproveKey] = useState("approve-only");
  const [rejectKey, setRejectKey] = useState("reject-only");

  const handleApprovePrimary = () => {
    if (approveKey === "approve-only") {
      onApproveOnly();
    } else {
      onApproveAndNext();
    }
  };

  const handleRejectPrimary = () => {
    if (rejectKey === "reject-only") {
      onRejectOnly();
    } else {
      onRejectAndNext();
    }
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
      <AppSplitButton
        options={APPROVE_OPTIONS}
        selectedKey={approveKey}
        onSelectedKeyChange={setApproveKey}
        onPrimaryClick={handleApprovePrimary}
        variant="solid"
        tone="primary"
        size="md"
        disabled={isApproveDisabled}
        className="min-w-0"
      />
      <AppSplitButton
        options={REJECT_OPTIONS}
        selectedKey={rejectKey}
        onSelectedKeyChange={setRejectKey}
        onPrimaryClick={handleRejectPrimary}
        variant="solid"
        tone="danger"
        size="md"
        disabled={isRejectDisabled}
        className="min-w-0"
      />
    </div>
  );
}
