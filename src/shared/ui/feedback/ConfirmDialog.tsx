import { AppButton } from "@/shared/ui/button";

import AppDialog from "./AppDialog";

type Props = {
  open: boolean;
  message: string;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  message,
  title = "確認",
  confirmLabel = "削除",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AppDialog
      open={open}
      onClose={onCancel}
      title={title}
      description={message}
      maxWidth="xs"
      actions={
        <>
          <AppButton variant="outline" tone="neutral" onClick={onCancel}>
            {cancelLabel}
          </AppButton>
          <AppButton variant="solid" tone="danger" onClick={onConfirm}>
            {confirmLabel}
          </AppButton>
        </>
      }
    />
  );
}
