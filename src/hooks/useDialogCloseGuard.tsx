import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

import LeaveGuardDialog from "@/shared/ui/feedback/LeaveGuardDialog";

type UseDialogCloseGuardOptions = {
  isDirty?: boolean;
  isBusy?: boolean;
  onClose: () => void;
};

const isPromiseLike = <T,>(value: T): value is T & PromiseLike<unknown> =>
  typeof value === "object" &&
  value !== null &&
  "then" in value &&
  typeof (value as PromiseLike<unknown>).then === "function";

export function useDialogCloseGuard({
  isDirty = false,
  isBusy = false,
  onClose,
}: UseDialogCloseGuardOptions): {
  dialog: ReactNode;
  requestClose: () => void;
  closeWithoutGuard: () => void;
} {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const shouldBlock = isDirty || isBusy;
  const skipGuardRef = useRef(false);

  useEffect(() => {
    if (!shouldBlock && confirmOpen) {
      setConfirmOpen(false);
    }
  }, [confirmOpen, shouldBlock]);

  const runWithoutGuard = useCallback(<T,>(callback: () => T): T => {
    skipGuardRef.current = true;

    const resetGuard = () => {
      skipGuardRef.current = false;
    };

    try {
      const result = callback();

      if (isPromiseLike(result)) {
        return Promise.resolve(result).finally(resetGuard) as T;
      }

      queueMicrotask(resetGuard);
      return result;
    } catch (error) {
      resetGuard();
      throw error;
    }
  }, []);

  const closeWithoutGuard = useCallback(() => {
    setConfirmOpen(false);
    runWithoutGuard(() => onClose());
  }, [onClose, runWithoutGuard]);

  const requestClose = useCallback(() => {
    if (shouldBlock && !skipGuardRef.current) {
      setConfirmOpen(true);
      return;
    }

    onClose();
  }, [onClose, shouldBlock]);

  const dialog = useMemo(
    () => (
      <LeaveGuardDialog
        open={confirmOpen}
        target="dialog"
        isBusy={isBusy}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={closeWithoutGuard}
      />
    ),
    [closeWithoutGuard, confirmOpen, isBusy],
  );

  return {
    dialog,
    requestClose,
    closeWithoutGuard,
  };
}
