import { useCallback, useState } from "react";

type UseActionButtonStateOptions = {
  canInteract: boolean;
  disabled?: boolean;
};

export function useActionButtonState({
  canInteract,
  disabled = false,
}: UseActionButtonStateOptions) {
  const [isPending, setIsPending] = useState(false);
  const isDisabled = disabled || !canInteract || isPending;

  const markPending = useCallback(() => {
    if (isDisabled) {
      return false;
    }

    setIsPending(true);
    return true;
  }, [isDisabled]);

  return {
    isDisabled,
    markPending,
  };
}
