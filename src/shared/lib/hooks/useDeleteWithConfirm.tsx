import { pushNotification } from "@shared/lib/store/notificationSlice";
import { useCallback, useState } from "react";

/**
 * Hook that wraps a delete function with a confirmation dialog and notification.
 *
 * @param message - Confirmation message to show to the user.
 * @param deleteFn - Async function that performs the deletion.
 * @param successMessage - Message to show on successful deletion.
 * @param errorMessage - Message to show on failure.
 * @returns A function that triggers the flow.
 */
export function useDeleteWithConfirm<TInput>(
  message: string,
  deleteFn: (input: TInput) => Promise<void>,
  successMessage: string,
  errorMessage: string
) {
  const [pendingInput, setPendingInput] = useState<TInput | null>(null);

  const requestDelete = useCallback((input: TInput) => {
    setPendingInput(input);
  }, []);

  const handleCancel = useCallback(() => {
    setPendingInput(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (pendingInput == null) return;

    const target = pendingInput;
    setPendingInput(null);

    try {
      await deleteFn(target);
      pushNotification({ tone: "success", message: successMessage });
    } catch {
      pushNotification({ tone: "error", message: errorMessage });
    }
  }, [pendingInput, deleteFn, successMessage, errorMessage]);

  return {
    requestDelete,
    confirmDialogProps: {
      open: pendingInput !== null,
      message,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}

export default useDeleteWithConfirm;
