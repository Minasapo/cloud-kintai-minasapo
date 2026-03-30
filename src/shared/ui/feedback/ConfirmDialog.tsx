import BaseDialog from "./BaseDialog";

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
  if (!open) {
    return null;
  }

  return (
    <BaseDialog
      open={open}
      onClose={onCancel}
      title={title}
      description={message}
      widthClassName="max-w-sm"
      actions={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700"
          >
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}
