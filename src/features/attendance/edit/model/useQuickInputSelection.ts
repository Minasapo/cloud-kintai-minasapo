import { useMemo, useRef, useState } from "react";

import type { QuickInputAction } from "./useQuickInputActions";

export function useQuickInputSelection(actions: QuickInputAction[]) {
  const [open, setOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [confirmLabel, setConfirmLabel] = useState<string | null>(null);
  const pendingActionRef = useRef<(() => void) | null>(null);

  const selectedAction = useMemo(
    () => actions.find((action) => action.key === selectedKey) ?? null,
    [actions, selectedKey],
  );

  const askConfirm = (label: string, action: () => void) => {
    setConfirmLabel(label);
    pendingActionRef.current = action;
    setOpen(true);
  };

  const applySelectedAction = () => {
    const action = selectedAction?.action ?? pendingActionRef.current;
    if (!action) {
      return;
    }

    action();
    setOpen(false);
    pendingActionRef.current = null;
    setSelectedKey(null);
    setConfirmLabel(null);
  };

  const close = () => {
    setOpen(false);
    pendingActionRef.current = null;
    setSelectedKey(null);
    setConfirmLabel(null);
  };

  return {
    open,
    selectedKey,
    selectedAction,
    confirmLabel,
    setOpen,
    setSelectedKey,
    askConfirm,
    applySelectedAction,
    close,
  };
}
