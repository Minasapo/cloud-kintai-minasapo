import BaseDialog from "./BaseDialog";

type LeaveGuardDialogProps = {
  open: boolean;
  target: "page" | "dialog";
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const getDescription = ({
  isBusy,
  target,
}: Pick<LeaveGuardDialogProps, "isBusy" | "target">) => {
  if (isBusy) {
    return "処理中です。中断される可能性があります。続行しますか？";
  }

  if (target === "dialog") {
    return "未保存の変更があります。破棄して閉じますか？";
  }

  return "未保存の変更があります。破棄して画面を離れますか？";
};

export default function LeaveGuardDialog({
  open,
  target,
  isBusy = false,
  onConfirm,
  onCancel,
}: LeaveGuardDialogProps) {
  return (
    <BaseDialog
      open={open}
      onClose={onCancel}
      title="変更内容の確認"
      description={getDescription({ isBusy, target })}
      widthClassName="max-w-sm"
      actions={
        <>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700"
          >
            破棄して続行
          </button>
        </>
      }
    />
  );
}
