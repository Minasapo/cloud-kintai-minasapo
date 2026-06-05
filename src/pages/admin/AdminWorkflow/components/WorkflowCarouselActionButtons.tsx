import { AppButton } from "@shared/ui/button";

type WorkflowCarouselActionButtonsProps = {
  onApproveAndNext: () => void;
  onRejectAndNext: () => void;
  isApproveDisabled: boolean;
  isRejectDisabled: boolean;
};

export default function WorkflowCarouselActionButtons({
  onApproveAndNext,
  onRejectAndNext,
  isApproveDisabled,
  isRejectDisabled,
}: WorkflowCarouselActionButtonsProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <AppButton
        className="min-w-0"
        onClick={() => {
          void onApproveAndNext();
        }}
        disabled={isApproveDisabled}
      >
        承認して次へ
      </AppButton>
      <AppButton
        tone="danger"
        className="min-w-0"
        onClick={() => {
          void onRejectAndNext();
        }}
        disabled={isRejectDisabled}
      >
        却下して次へ
      </AppButton>
    </div>
  );
}
