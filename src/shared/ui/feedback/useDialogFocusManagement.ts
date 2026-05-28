import { type RefObject, useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

type UseDialogFocusManagementOptions = {
  open: boolean;
  onClose?: () => void;
  dialogRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  closeOnEscape?: boolean;
  trapFocus?: boolean;
  lockBodyScroll?: boolean;
  onKeyDown?: (event: KeyboardEvent) => void;
};

const getFocusableElements = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute("disabled") && element.getAttribute("tabindex") !== "-1",
  );

export function useDialogFocusManagement({
  open,
  onClose,
  dialogRef,
  initialFocusRef,
  closeOnEscape = true,
  trapFocus = true,
  lockBodyScroll = true,
  onKeyDown,
}: UseDialogFocusManagementOptions) {
  const previousActiveElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    previousActiveElementRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    if (lockBodyScroll) {
      document.body.style.overflow = "hidden";
    }

    const initialFocusTarget =
      initialFocusRef?.current ??
      (dialogRef.current ? getFocusableElements(dialogRef.current)[0] : undefined) ??
      dialogRef.current;
    initialFocusTarget?.focus();

    return () => {
      if (lockBodyScroll) {
        document.body.style.overflow = previousOverflow;
      }
      if (previousActiveElementRef.current instanceof HTMLElement) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [open, dialogRef, initialFocusRef, lockBodyScroll]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (trapFocus && event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusableElements = getFocusableElements(dialog);
        if (focusableElements.length === 0) {
          event.preventDefault();
          dialog.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement as HTMLElement | null;

        if (
          event.shiftKey &&
          (!activeElement || activeElement === firstElement || !dialog.contains(activeElement))
        ) {
          event.preventDefault();
          lastElement.focus();
          return;
        }

        if (
          !event.shiftKey &&
          (!activeElement || activeElement === lastElement || !dialog.contains(activeElement))
        ) {
          event.preventDefault();
          firstElement.focus();
        }

        return;
      }

      onKeyDown?.(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, trapFocus, onClose, dialogRef, onKeyDown]);
}
