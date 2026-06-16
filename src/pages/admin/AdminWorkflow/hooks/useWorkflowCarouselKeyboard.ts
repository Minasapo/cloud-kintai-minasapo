import { RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

type UseWorkflowCarouselKeyboardParams = {
  open: boolean;
  onClose: () => void;
  isCompleted: boolean;
  currentWorkflowId: string | null;
  handlePrev: () => void;
  handleNext: () => void;
  handleApproveAndNext: () => Promise<void>;
  handleRejectAndNext: () => Promise<void>;
  enableApprovalActions: boolean;
  onOpenInRightPanel: (workflowId: string) => void;
  dialogRef: RefObject<HTMLDivElement | null>;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
};

export function useWorkflowCarouselKeyboard({
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
}: UseWorkflowCarouselKeyboardParams) {
  const previousActiveElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveElementRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousActiveElementRef.current instanceof HTMLElement) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [open, closeButtonRef]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab") {
        if (!dialogRef.current) {
          return;
        }

        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((element) => !element.hasAttribute("disabled"));

        if (focusable.length === 0) {
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];
        const activeElement = document.activeElement as HTMLElement | null;

        if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }

        return;
      }

      if (isCompleted) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrev();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNext();
        return;
      }

      if (event.key === "Enter" && currentWorkflowId) {
        event.preventDefault();
        onOpenInRightPanel(currentWorkflowId);
        return;
      }

      if (!enableApprovalActions) {
        return;
      }

      const lowerKey = event.key.toLowerCase();
      if (lowerKey === "y") {
        event.preventDefault();
        void handleApproveAndNext();
        return;
      }

      if (lowerKey === "n") {
        event.preventDefault();
        void handleRejectAndNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentWorkflowId,
    dialogRef,
    enableApprovalActions,
    handleApproveAndNext,
    handleNext,
    handlePrev,
    handleRejectAndNext,
    isCompleted,
    onClose,
    onOpenInRightPanel,
    open,
  ]);
}
