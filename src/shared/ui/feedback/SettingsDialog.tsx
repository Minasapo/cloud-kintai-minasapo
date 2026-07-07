import { AppButton } from "@shared/ui/button";
import { type ReactNode } from "react";

import AppDialog from "./AppDialog";
import { useDialogCloseGuard } from "./useDialogCloseGuard";

type SettingsDialogProps = {
  title: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  isDirty?: boolean;
  isBusy?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  renderActions?: (requestClose: () => void) => ReactNode;
};

export default function SettingsDialog({
  title,
  description,
  open,
  onClose,
  isDirty,
  isBusy,
  maxWidth,
  children,
  renderActions,
}: SettingsDialogProps) {
  const { dialog, requestClose } = useDialogCloseGuard({
    isDirty,
    isBusy,
    onClose,
  });

  return (
    <>
      {dialog}
      <AppDialog
        open={open}
        onClose={requestClose}
        title={title}
        description={description}
        maxWidth={maxWidth}
        actions={
          renderActions ? (
            renderActions(requestClose)
          ) : (
            <AppButton
              variant="outline"
              tone="neutral"
              size="sm"
              onClick={requestClose}
            >
              閉じる
            </AppButton>
          )
        }
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1">{children}</div>
      </AppDialog>
    </>
  );
}
